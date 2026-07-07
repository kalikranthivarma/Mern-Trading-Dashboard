import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Session from '../models/Session.js';
import ApiError from '../utils/ApiError.js';
import { sendEmail } from '../helpers/emailHelper.js';

const DEFAULT_ACCESS_EXPIRES_IN = '15m';
const DEFAULT_REFRESH_EXPIRES_IN = '7d';
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

const publicUserFields = 'name email role isVerified profileImage phone lastLogin createdAt updatedAt';

const normalizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  profileImage: user.profileImage,
  phone: user.phone,
  lastLogin: user.lastLogin
});

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const generateOpaqueToken = () => crypto.randomBytes(32).toString('hex');

const parseDurationToMs = (value, fallbackMs) => {
  if (!value) return fallbackMs;
  const match = String(value).trim().match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) return fallbackMs;

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return amount * multipliers[unit];
};

const createAccessToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_ACCESS_EXPIRES_IN }
);

const createRefreshToken = (user) => jwt.sign(
  { id: user._id, role: user.role, tokenId: crypto.randomUUID() },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || DEFAULT_REFRESH_EXPIRES_IN }
);

const createSession = async ({ user, refreshToken, req, replacedByTokenHash }) => {
  const refreshTokenHash = hashToken(refreshToken);
  const expiresInMs = parseDurationToMs(process.env.REFRESH_TOKEN_EXPIRES_IN, 7 * 24 * 60 * 60 * 1000);

  await Session.create({
    user: user._id,
    refreshTokenHash,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    expiresAt: new Date(Date.now() + expiresInMs),
    replacedByTokenHash
  });

  return refreshTokenHash;
};

const sendVerificationEmail = async (user, token) => {
  const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl.replace(/\/$/, '')}/verify-email?token=${token}`;

  return sendEmail({
    to: user.email,
    subject: 'Verify your trading dashboard account',
    text: `Verify your account using this link: ${verifyUrl}`,
    html: `
      <p>Welcome to Trading Dashboard.</p>
      <p>Click the link below to verify your email address and activate your account:</p>
      <p><a href="${verifyUrl}">Verify email address</a></p>
      <p>If the button does not work, copy this link into your browser:</p>
      <p>${verifyUrl}</p>
    `
  });
};

const sendPasswordResetEmail = async (user, token) => {
  return sendEmail({
    to: user.email,
    subject: 'Reset your trading dashboard password',
    text: `Reset your password with this token: ${token}. It expires in 15 minutes.`,
    html: `<p>Reset your password with this token:</p><p><strong>${token}</strong></p><p>This token expires in 15 minutes.</p>`
  });
};

const issueTokenPair = async ({ user, req, replacedByTokenHash }) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  await createSession({ user, refreshToken, req, replacedByTokenHash });

  return { accessToken, refreshToken };
};

export const register = async ({ name, email, password, role = 'Viewer', req }) => {
  const existingUser = await User.findOne({ email }).select('+emailVerificationToken +emailVerificationExpires');
  if (existingUser?.isVerified) throw new ApiError(409, 'User already exists');

  const verificationToken = generateOpaqueToken();
  const user = existingUser || new User({ email });

  user.name = name;
  user.password = password;
  user.role = role;
  user.emailVerificationToken = hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
  await user.save();

  const emailResult = await sendVerificationEmail(user, verificationToken);

  const verification = {
    emailSent: emailResult.sent,
    autoVerified: false
  };

  if (!emailResult.sent && process.env.NODE_ENV !== 'production') {
    verification.verificationToken = verificationToken;
  }

  return {
    user: normalizeUser(user),
    verification
  };
};

export const login = async ({ email, password, req }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isVerified) throw new ApiError(403, 'Email verification required');

  user.lastLogin = new Date();
  await user.save();

  const tokens = await issueTokenPair({ user, req });

  return {
    user: normalizeUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
};

export const refreshAccessToken = async ({ refreshToken, req }) => {
  if (!refreshToken) throw new ApiError(401, 'Refresh token missing');

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const currentTokenHash = hashToken(refreshToken);
  const session = await Session.findOne({
    refreshTokenHash: currentTokenHash,
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() }
  }).select('+refreshTokenHash');

  if (!session) throw new ApiError(401, 'Refresh token expired or revoked');

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'Authenticated user no longer exists');
  if (!user.isVerified) throw new ApiError(403, 'Email verification required');

  const tokens = await issueTokenPair({
    user,
    req,
    replacedByTokenHash: currentTokenHash
  });

  session.revokedAt = new Date();
  session.replacedByTokenHash = hashToken(tokens.refreshToken);
  await session.save();

  return {
    user: normalizeUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
};

export const logout = async ({ refreshToken }) => {
  if (refreshToken) {
    await Session.findOneAndUpdate(
      { refreshTokenHash: hashToken(refreshToken), revokedAt: { $exists: false } },
      { revokedAt: new Date() }
    );
  }

  return {};
};

export const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'User not found');

  const resetToken = generateOpaqueToken();
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save({ validateBeforeSave: false });

  const emailResult = await sendPasswordResetEmail(user, resetToken);

  if (!emailResult.sent && process.env.NODE_ENV !== 'production') {
    return { resetToken };
  }

  return {};
};

export const resetPassword = async ({ token, password }) => {
  const user = await User.findOne({
    passwordResetToken: hashToken(token),
    passwordResetExpires: { $gt: new Date() }
  }).select('+passwordResetToken +passwordResetExpires +password');

  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await Session.updateMany({ user: user._id, revokedAt: { $exists: false } }, { revokedAt: new Date() });

  return {};
};

export const verifyEmail = async ({ token, req }) => {
  const user = await User.findOne({
    emailVerificationToken: hashToken(token),
    emailVerificationExpires: { $gt: new Date() }
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) throw new ApiError(400, 'Invalid or expired verification token');

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const tokens = await issueTokenPair({ user, req });

  return {
    user: normalizeUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
};

export const changePassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  await Session.updateMany({ user: user._id, revokedAt: { $exists: false } }, { revokedAt: new Date() });

  return {};
};

export const updateProfile = async ({ userId, payload }) => {
  const allowedFields = ['name', 'phone', 'profileImage'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) updates[field] = payload[field];
  });

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
    select: publicUserFields
  }).lean();

  if (!user) throw new ApiError(404, 'User not found');

  return { user: normalizeUser(user) };
};
