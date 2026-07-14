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
  lastLogin: user.lastLogin,
  availableBalance: user.availableBalance,
  lockedBalance: user.lockedBalance,
  kycStatus: user.kycStatus
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
    subject: 'Action Required: Verify your Trading Dashboard Account',
    text: `Welcome to Trading Dashboard. Verify your account using this link: ${verifyUrl}`,
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a1128; color: #f8fafc; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);">
        <div style="background-color: #1e293b; padding: 32px 40px; text-align: center; border-bottom: 1px solid #334155;">
          <h1 style="margin: 0; color: #fff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Neo-Fintech</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="margin-top: 0; color: #fff; font-size: 20px; font-weight: 600;">Welcome, ${user.name}!</h2>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            Thank you for creating an account. To unlock full trading access and secure your account, please verify your email address by clicking the button below.
          </p>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${verifyUrl}" style="display: inline-block; background-color: #0ea5e9; color: #fff; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: 600; border-radius: 9999px; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);">
              Verify Email Address
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 16px;">
            Or copy and paste this link into your browser:
            <br>
            <a href="${verifyUrl}" style="color: #38bdf8; text-decoration: none; word-break: break-all;">${verifyUrl}</a>
          </p>
          <div style="background-color: rgba(14, 165, 233, 0.1); border-left: 4px solid #0ea5e9; padding: 16px; border-radius: 0 8px 8px 0; margin-top: 32px;">
            <p style="margin: 0; color: #bae6fd; font-size: 14px;">
              <strong>Security Notice:</strong> This link will expire in 24 hours. If you did not create this account, you can safely ignore this email.
            </p>
          </div>
        </div>
        <div style="background-color: #0f172a; padding: 24px 40px; text-align: center; border-top: 1px solid #1e293b;">
          <p style="margin: 0; color: #475569; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Neo-Fintech Trading. All rights reserved.
          </p>
        </div>
      </div>
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

export const register = async ({ name, email, password, role = 'user', req }) => {
  const existingUser = await User.findOne({ email }).select('+emailVerificationToken +emailVerificationExpires');
  if (existingUser?.isVerified) throw new ApiError(409, 'User already exists');

  const verificationToken = generateOpaqueToken();
  const user = existingUser || new User({ email });

  user.name = name;
  user.password = password;
  user.role = role;
  user.emailVerificationToken = hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
  user.lastVerificationEmailSentAt = new Date();
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

export const resendVerificationEmail = async ({ email }) => {
  const user = await User.findOne({ email }).select('+emailVerificationToken +emailVerificationExpires +lastVerificationEmailSentAt');
  
  if (!user) throw new ApiError(404, 'User not found');
  if (user.isVerified) throw new ApiError(400, 'Account is already verified');

  const now = new Date();
  if (user.lastVerificationEmailSentAt) {
    const secondsSinceLastEmail = (now - user.lastVerificationEmailSentAt) / 1000;
    if (secondsSinceLastEmail < 60) {
      throw new ApiError(429, `Please wait ${Math.ceil(60 - secondsSinceLastEmail)} seconds before requesting a new email`);
    }
  }

  const verificationToken = generateOpaqueToken();
  user.emailVerificationToken = hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
  user.lastVerificationEmailSentAt = now;
  await user.save({ validateBeforeSave: false });

  const emailResult = await sendVerificationEmail(user, verificationToken);

  return { emailSent: emailResult.sent };
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
