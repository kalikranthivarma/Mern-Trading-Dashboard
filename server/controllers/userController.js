import { listUsers, findUserById } from '../services/userService.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await listUsers();
    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user._id);
    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadKyc = async (req, res, next) => {
  try {
    const { documentUrl } = req.body;
    if (!documentUrl) {
      return next(new ApiError(400, "Please provide a document URL"));
    }

    const user = await User.findById(req.user._id);
    if (!user) return next(new ApiError(404, "User not found"));

    user.kycDocument = documentUrl;
    user.kycStatus = "pending";
    await user.save();

    res.status(200).json({
      success: true,
      message: 'KYC Document submitted successfully',
      data: { kycStatus: user.kycStatus }
    });
  } catch (error) {
    next(error);
  }
};
