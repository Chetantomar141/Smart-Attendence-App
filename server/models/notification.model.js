export default (sequelize, Sequelize) => {
  const Notification = sequelize.define("notification", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    isRead: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    type: {
      type: Sequelize.ENUM('alert', 'reminder', 'notice', 'event', 'assignment', 'attendance', 'fee'),
      defaultValue: 'notice'
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });

  return Notification;
};
