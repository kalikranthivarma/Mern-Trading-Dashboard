import { listUsers, findUserById } from '../services/userService.js';

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
