import dbConfig from "../config/db.config.js";
import Sequelize from "sequelize";
import userModel from "./user.model.js";
import attendanceModel from "./attendance.model.js";
import feeModel from "./fee.model.js";
import notificationModel from "./notification.model.js";
import noticeModel from "./notice.model.js";
import eventModel from "./event.model.js";
import assignmentModel from "./assignment.model.js";
import submissionModel from "./submission.model.js";
import subjectModel from "./subject.model.js";
import expenseModel from "./expense.model.js";
import markModel from "./mark.model.js";
import salaryModel from "./salary.model.js";
import classModel from "./class.model.js";

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.users = userModel(sequelize, Sequelize);
db.attendance = attendanceModel(sequelize, Sequelize);
db.fees = feeModel(sequelize, Sequelize);
db.notifications = notificationModel(sequelize, Sequelize);
db.notices = noticeModel(sequelize, Sequelize);
db.events = eventModel(sequelize, Sequelize);
db.assignments = assignmentModel(sequelize, Sequelize);
db.submissions = submissionModel(sequelize, Sequelize);
db.subjects = subjectModel(sequelize, Sequelize);
db.expenses = expenseModel(sequelize, Sequelize);
db.marks = markModel(sequelize, Sequelize);
db.salaries = salaryModel(sequelize, Sequelize);
db.classes = classModel(sequelize, Sequelize);

// Relationships
// User - User (Teacher - Student)
db.users.hasMany(db.users, { as: 'students', foreignKey: 'teacherId' });
db.users.belongsTo(db.users, { as: 'teacher', foreignKey: 'teacherId' });

// User - Parent
db.users.hasMany(db.users, { as: 'children', foreignKey: 'parentId' });
db.users.belongsTo(db.users, { as: 'parent', foreignKey: 'parentId' });

// Subject - Teacher
db.users.hasMany(db.subjects, { as: 'taughtSubjects', foreignKey: 'teacherId' });
db.subjects.belongsTo(db.users, { as: 'teacher', foreignKey: 'teacherId' });

// User - Attendance
db.users.hasMany(db.attendance, { foreignKey: 'userId' });
db.attendance.belongsTo(db.users, { foreignKey: 'userId' });

// User - Fee
db.users.hasOne(db.fees, { foreignKey: 'userId' });
db.fees.belongsTo(db.users, { foreignKey: 'userId' });

// User - Notification
db.users.hasMany(db.notifications, { foreignKey: 'userId' });
db.notifications.belongsTo(db.users, { foreignKey: 'userId' });

// User - Notice (Creator)
db.users.hasMany(db.notices, { foreignKey: 'createdBy' });
db.notices.belongsTo(db.users, { foreignKey: 'createdBy' });

// User - Event (Creator)
db.users.hasMany(db.events, { foreignKey: 'createdBy' });
db.events.belongsTo(db.users, { foreignKey: 'createdBy' });

// User - Assignment (Teacher)
db.users.hasMany(db.assignments, { foreignKey: 'teacherId' });
db.assignments.belongsTo(db.users, { foreignKey: 'teacherId' });

// User - Submission (Student)
db.users.hasMany(db.submissions, { foreignKey: 'studentId' });
db.submissions.belongsTo(db.users, { foreignKey: 'studentId' });

// Assignment - Submission
db.assignments.hasMany(db.submissions, { foreignKey: 'assignmentId' });
db.submissions.belongsTo(db.assignments, { foreignKey: 'assignmentId' });

// User - Marks
db.users.hasMany(db.marks, { as: 'marks', foreignKey: 'studentId' });
db.marks.belongsTo(db.users, { as: 'student', foreignKey: 'studentId' });

// Teacher - Marks
db.users.hasMany(db.marks, { as: 'gradedMarks', foreignKey: 'teacherId' });
db.marks.belongsTo(db.users, { as: 'teacher', foreignKey: 'teacherId' });

// User - Salary
db.users.hasMany(db.salaries, { foreignKey: 'teacherId' });
db.salaries.belongsTo(db.users, { foreignKey: 'teacherId' });

// Class - Teacher
db.users.hasOne(db.classes, { foreignKey: 'teacherId' });
db.classes.belongsTo(db.users, { as: 'classTeacher', foreignKey: 'teacherId' });

export default db;
