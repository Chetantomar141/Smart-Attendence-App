export default (sequelize, Sequelize) => {
  const Subject = sequelize.define("subject", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    class: {
      type: Sequelize.STRING,
      allowNull: false
    },
    teacherId: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });

  return Subject;
};
