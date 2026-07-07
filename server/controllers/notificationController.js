import { listNotifications } from '../services/notificationService.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await listNotifications(req.user._id, Number(req.query.limit || 50));
    const unread = notifications.filter((notification) => !notification.read).length;
    res.json({ notifications, unread });
  } catch (error) {
    next(error);
  }
};
