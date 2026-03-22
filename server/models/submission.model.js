export default (sequelize, Sequelize) => {
  const Submission = sequelize.define("submission", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    studentId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    assignmentId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    submissionDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    attachment: {
      type: Sequelize.STRING, // File path for the student's submission
      allowNull: false
    },
    grade: {
      type: Sequelize.STRING,
      allowNull: true
    },
    feedback: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  });

  return Submission;
};
