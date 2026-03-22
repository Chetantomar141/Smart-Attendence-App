import db from "../models/index.js";
const User = db.users;
const Attendance = db.attendance;
const Fee = db.fees;
const Mark = db.marks;
import { Op } from "sequelize";
import * as notificationService from "../services/notification.service.js";
import * as pdfService from "../services/pdf.service.js";
import bcrypt from "bcryptjs";
import csv from "fast-csv";
import fs from "fs";
import path from "path";

export const getTeacherStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { teacherId: req.userId, role: 'student' },
      include: [
        { model: Fee },
        { model: User, as: 'parent' }
      ]
    });
    res.send(students);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const addStudent = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { 
      name, email, class: className, rollNo, section,
      fatherName, parentEmail, parentMobile, address 
    } = req.body;

    // 1. Generate Credentials
    const studentUsername = `student_${rollNo}`.toLowerCase();
    const parentUsername = `parent_${rollNo}`.toLowerCase();
    
    const generatePassword = () => Math.random().toString(36).slice(-8);
    const studentPassword = generatePassword();
    const parentPassword = generatePassword();

    // 2. Create Parent Account
    const parent = await User.create({
      username: parentUsername,
      password: bcrypt.hashSync(parentPassword, 8),
      role: 'parent',
      name: fatherName,
      email: parentEmail,
      phoneNumber: parentMobile,
    }, { transaction: t });

    // 3. Create Student Account
    const student = await User.create({
      username: studentUsername,
      password: bcrypt.hashSync(studentPassword, 8),
      role: 'student',
      name: name,
      email: email,
      class: className,
      rollNo: rollNo,
      teacherId: req.userId,
      parentId: parent.id,
      uniqueId: `STU${Date.now().toString().slice(-6)}`
    }, { transaction: t });

    // 4. Create Initial Fee Record
    await Fee.create({
      total: 50000,
      paid: 0,
      userId: student.id
    }, { transaction: t });

    await t.commit();

    // 5. Send Credentials Notification
    const emailContent = `
      <h3>Login Details</h3>
      <p><b>Student Login:</b><br/>
      Username: ${studentUsername}<br/>
      Password: ${studentPassword}</p>
      
      <p><b>Parent Login:</b><br/>
      Username: ${parentUsername}<br/>
      Password: ${parentPassword}</p>
      
      <p>Please login at: <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">${process.env.CLIENT_URL || 'http://localhost:5173'}</a></p>
    `;

    // Send to Student Email
    if (email) {
      await notificationService.sendEmail(email, "Login Details", emailContent);
    }
    // Send to Parent Email
    if (parentEmail) {
      await notificationService.sendEmail(parentEmail, "Login Details", emailContent);
    }

    res.send({ 
      message: "Student and Parent accounts created successfully!",
      student: { username: studentUsername, password: studentPassword },
      parent: { username: parentUsername, password: parentPassword }
    });
  } catch (err) {
    await t.rollback();
    res.status(500).send({ message: err.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, uniqueId, class: className, rollNo } = req.body;
    
    await User.update({
      name,
      email,
      uniqueId,
      class: className,
      rollNo
    }, {
      where: { id, teacherId: req.userId }
    });

    res.send({ message: "Student updated successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByPk(id);
    if (student && student.parentId) {
      await User.destroy({ where: { id: student.parentId } });
    }
    await User.destroy({
      where: { id, teacherId: req.userId }
    });
    res.send({ message: "Student and associated parent deleted successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const markStudentAttendance = async (req, res) => {
  try {
    const { studentId, date, status } = req.body;
    
    const [attendance, created] = await Attendance.findOrCreate({
      where: { userId: studentId, date },
      defaults: { status, role: 'student' }
    });

    if (!created) {
      attendance.status = status;
      await attendance.save();
    }

    if (status === 'absent') {
      const student = await User.findByPk(studentId, {
        include: [{ model: User, as: 'parent' }]
      });
      
      if (student && student.parent) {
        await notificationService.notifyParent(
          student,
          student.parent,
          "Attendance Alert",
          `${student.name} was marked ABSENT on ${date}.`,
          "attendance"
        );
      }
    }

    res.send({ message: "Attendance updated successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const updateStudentFees = async (req, res) => {
  try {
    const { studentId, total, paid, miscellaneous, transport } = req.body;
    
    const fee = await Fee.findOne({ where: { userId: studentId } });
    if (!fee) {
      await Fee.create({ userId: studentId, total, paid, miscellaneous, transport, status: (paid >= total) ? 'Paid' : 'Pending' });
    } else {
      fee.total = total;
      fee.paid = paid;
      fee.miscellaneous = miscellaneous;
      fee.transport = transport;
      fee.status = (paid >= total) ? 'Paid' : 'Pending';
      await fee.save();
    }
    res.send({ message: "Fees updated successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getTeacherStats = async (req, res) => {
  try {
    const teacherId = req.userId;
    const today = new Date().toLocaleDateString('en-CA');

    // 1. Total Students for this teacher
    const totalStudents = await User.count({
      where: { teacherId, role: 'student' }
    });

    // 2. Attendance Stats for today
    // We need to find all students of this teacher and then check their attendance
    const students = await User.findAll({
      where: { teacherId, role: 'student' },
      attributes: ['id']
    });
    const studentIds = students.map(s => s.id);

    const presentToday = await Attendance.count({
      where: {
        userId: { [Op.in]: studentIds },
        date: today,
        status: 'present'
      }
    });

    const absentToday = totalStudents - presentToday;

    res.send({
      totalStudents,
      presentToday,
      absentToday,
      attendanceRate: totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getAttendanceHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const history = await Attendance.findAll({
      where: { userId: studentId },
      order: [['date', 'DESC']],
      limit: 30
    });
    res.send(history);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const exportAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await User.findByPk(studentId);
    const attendance = await Attendance.findAll({
      where: { userId: studentId },
      order: [['date', 'DESC']]
    });

    if (!student) return res.status(404).send({ message: "Student not found" });

    const pdfBuffer = await pdfService.generateAttendanceReport(student, attendance);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${student.name.replace(/\s+/g, '_')}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const bulkAddStudents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send({ message: "Please upload a CSV file!" });

    const students = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true }))
      .on("error", (error) => {
        throw error.message;
      })
      .on("data", (row) => {
        students.push({
          username: row.username,
          password: bcrypt.hashSync(row.password || '123456', 8),
          name: row.name,
          email: row.email,
          uniqueId: row.uniqueId,
          class: row.class,
          rollNo: row.rollNo,
          role: 'student',
          teacherId: req.userId
        });
      })
      .on("end", async () => {
        try {
          await User.bulkCreate(students);
          res.send({ message: `${students.length} students imported successfully!` });
        } catch (err) {
          res.status(500).send({ message: "Fail to import data into database!" });
        }
      });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// --- Marks Management ---

export const addMarks = async (req, res) => {
  try {
    const { studentId, subject, marksObtained, totalMarks, examType } = req.body;

    // Calculate Grade
    const percentage = (marksObtained / totalMarks) * 100;
    let grade = 'Fail';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 75) grade = 'B';
    else if (percentage >= 50) grade = 'C';

    const mark = await Mark.create({
      studentId,
      subject,
      marksObtained,
      totalMarks,
      examType,
      grade,
      teacherId: req.userId
    });

    res.send({ message: "Marks added successfully!", mark });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getStudentMarks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const marks = await Mark.findAll({
      where: { studentId },
      order: [['createdAt', 'DESC']]
    });
    res.send(marks);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getTeacherClasses = async (req, res) => {
  try {
    const classes = await User.findAll({
      where: { teacherId: req.userId, role: 'student' },
      attributes: ['class', [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'studentCount']],
      group: ['class']
    });
    res.send(classes);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
