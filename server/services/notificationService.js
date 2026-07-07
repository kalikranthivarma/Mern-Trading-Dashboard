import Notification from '../models/Notification.js';

export const listNotifications = async (userId, limit = 50) =>
  Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(limit);

export const createNotification = async (userId, payload) =>
  Notification.create({ user: userId, ...payload });

export const markAsRead = async (notificationId, userId) =>
  Notification.findOneAndUpdate({ _id: notificationId, user: userId }, { read: true }, { new: true });
