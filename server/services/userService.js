import User from '../models/User.js';

export const findUserByEmail = async (email) => User.findOne({ email });

export const findUserById = async (id) => User.findById(id).select('-password').lean();

export const findUserByIdWithToken = async (id) => User.findById(id).select('-password').lean();

export const createUser = async (payload) => {
  return User.create(payload);
};

export const listUsers = async () => User.find().select('-password').lean();

export const saveRefreshToken = async (userId) => User.findById(userId).select('-password').lean();

export const clearRefreshToken = async (userId) => User.findById(userId).select('-password').lean();

export const setResetToken = async (userId, token, expiresAt) => {
  return User.findByIdAndUpdate(userId, { passwordResetToken: token, passwordResetExpires: expiresAt }, { new: true });
};

export const findByResetToken = async (token) => User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });

export const markEmailVerified = async (userId) => User.findByIdAndUpdate(userId, { isVerified: true }, { new: true });
