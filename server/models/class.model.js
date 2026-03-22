export default (sequelize, Sequelize) => {
  const Class = sequelize.define("class", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    teacherId: {
      type: Sequelize.INTEGER,
      allowNull: true
    }
  });

  return Class;
};
