export default (sequelize, Sequelize) => {
  const Assignment = sequelize.define("assignment", {
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
    deadline: {
      type: Sequelize.DATE,
      allowNull: false
    },
    attachment: {
      type: Sequelize.STRING, // File path for the teacher's assignment description
      allowNull: true
    },
    teacherId: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });

  return Assignment;
};
