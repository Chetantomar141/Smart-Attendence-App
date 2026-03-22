export default (sequelize, Sequelize) => {
  const Attendance = sequelize.define("attendance", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    loginTime: {
      type: Sequelize.TIME,
      allowNull: true
    },
    logoutTime: {
      type: Sequelize.TIME,
      allowNull: true
    },
    latitude: {
      type: Sequelize.FLOAT,
      allowNull: true
    },
    longitude: {
      type: Sequelize.FLOAT,
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM('present', 'absent', 'late'),
      defaultValue: 'absent'
    }
  });

  return Attendance;
};
