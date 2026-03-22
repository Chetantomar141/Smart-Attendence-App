import db from "../models/index.js";
const Notification = db.notifications;

export const sendNotification = async (req, userId, title, message, type = 'notice') => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type
    });

    const io = req.app.get('socketio');
    if (io) {
      io.to(`user-${userId}`).emit('notification', notification);
    }

    return notification;
  } catch (err) {
    console.error("Error sending notification:", err);
  }
};
