import db from "../models/index.js";
const Notification = db.notifications;

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });
    res.send(notifications);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.update(
      { isRead: true },
      { where: { id, userId: req.userId } }
    );
    res.send({ message: "Notification marked as read!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
