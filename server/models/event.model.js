export default (sequelize, Sequelize) => {
  const Event = sequelize.define("event", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    time: {
      type: Sequelize.STRING,
      allowNull: true
    },
    location: {
      type: Sequelize.STRING,
      allowNull: true
    },
    attachment: {
      type: Sequelize.STRING, // File path
      allowNull: true
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });

  return Event;
};
