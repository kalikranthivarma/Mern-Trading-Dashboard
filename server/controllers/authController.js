import {
  register,
  login,
  logout,
  refreshAccessToken,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  verifyEmail as verifyEmailService,
  resendVerificationEmail as resendVerificationEmailService,
  changePassword as changePasswordService,
  updateProfile as updateProfileService
} from '../services/authService.js';

const attachRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    path: '/'
  });
};

export const registerUser = async (req, res, next) => {
  try {
    const result = await register({ ...req.body, req });
    clearRefreshCookie(res);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Verify your email to activate trading access.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        verification: result.verification
      }
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const result = await login({ ...req.body, req });
    attachRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const result = await refreshAccessToken({ refreshToken: req.cookies.refreshToken, req });
    attachRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    await logout({ refreshToken: req.cookies.refreshToken });
    clearRefreshCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await forgotPasswordService(req.body);

    res.status(200).json({
      success: true,
      message: 'Password reset token sent to email',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await resetPasswordService(req.body);
    clearRefreshCookie(res);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const result = await verifyEmailService({ token: req.params.token, req });
    attachRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const result = await resendVerificationEmailService({ email: req.body.email });

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    await changePasswordService({
      userId: req.user._id,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword
    });
    clearRefreshCookie(res);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again.',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const result = await updateProfileService({
      userId: req.user._id,
      payload: req.body
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
