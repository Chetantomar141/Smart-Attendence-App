export default (sequelize, Sequelize) => {
  const Notice = sequelize.define("notice", {
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
    attachment: {
      type: Sequelize.STRING, // File path
      allowNull: true
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });

  return Notice;
};
