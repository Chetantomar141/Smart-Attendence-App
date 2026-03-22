export default (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    role: {
      type: Sequelize.ENUM('admin', 'teacher', 'student', 'parent'),
      defaultValue: 'student'
    },
    studentId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    },
    uniqueId: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    },
    teacherId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    profilePhoto: {
      type: Sequelize.STRING,
      allowNull: true
    },
    phoneNumber: {
      type: Sequelize.STRING,
      allowNull: true
    },
    class: {
      type: Sequelize.STRING,
      allowNull: true
    },
    rollNo: {
      type: Sequelize.STRING,
      allowNull: true
    },
    parentId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    subjects: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    },
    fatherName: {
      type: Sequelize.STRING,
      allowNull: true
    },
    salary: {
      type: Sequelize.DOUBLE,
      allowNull: true,
      defaultValue: 0
    },
    subject: {
      type: Sequelize.STRING,
      allowNull: true
    }
  });

  return User;
};
