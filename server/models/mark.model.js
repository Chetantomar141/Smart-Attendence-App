export default (sequelize, Sequelize) => {
  const Mark = sequelize.define("mark", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    studentId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    subject: {
      type: Sequelize.STRING,
      allowNull: false
    },
    marksObtained: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    totalMarks: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 100
    },
    examType: {
      type: Sequelize.STRING, // Midterm, Final, Unit Test, etc.
      allowNull: false
    },
    grade: {
      type: Sequelize.STRING,
      allowNull: true
    },
    teacherId: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });

  return Mark;
};
