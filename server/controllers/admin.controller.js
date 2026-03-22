import db from "../models/index.js";
const User = db.users;
const Attendance = db.attendance;
const Fee = db.fees;
const Expense = db.expenses;
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
const Salary = db.salaries;
const Class = db.classes;
const Mark = db.marks;

import * as notificationService from "../services/notification.service.js";
import * as pdfService from "../services/pdf.service.js";

export const getStats = async (req, res) => {
  try {
    const totalTeachers = await User.count({ where: { role: 'teacher' } });
    const totalStudents = await User.count({ where: { role: 'student' } });
    
    // Get local date string YYYY-MM-DD
    const todayStr = new Date().toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
    
    const totalAttendanceToday = await Attendance.count({
      where: {
        date: todayStr,
        status: 'present'
      }
    });
    
    const fees = await Fee.findAll();
    const totalFeesCollected = fees.reduce((sum, fee) => sum + fee.paid, 0);
    const totalFeesPending = fees.reduce((sum, fee) => sum + (fee.total - fee.paid), 0);

    const expenses = await Expense.findAll();
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalFeesCollected - totalExpenses;

    // Monthly Revenue for Chart
    const monthlyRevenue = [
      { month: 'Jan', revenue: 0 }, { month: 'Feb', revenue: 0 }, { month: 'Mar', revenue: 0 },
      { month: 'Apr', revenue: 0 }, { month: 'May', revenue: 0 }, { month: 'Jun', revenue: 0 },
      { month: 'Jul', revenue: 0 }, { month: 'Aug', revenue: 0 }, { month: 'Sep', revenue: 0 },
      { month: 'Oct', revenue: 0 }, { month: 'Nov', revenue: 0 }, { month: 'Dec', revenue: 0 }
    ];

    fees.forEach(f => {
      const m = new Date(f.createdAt).getMonth();
      monthlyRevenue[m].revenue += f.paid;
    });

    res.send({
      totalTeachers,
      totalStudents,
      totalAttendanceToday,
      totalFeesCollected,
      totalFeesPending,
      totalExpenses,
      netProfit,
      monthlyRevenue
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const addTeacher = async (req, res) => {
  try {
    const { username, password, name, email, uniqueId, phoneNumber, subject, salary } = req.body;
    
    if (!username || !password || !name || !email || !uniqueId) {
      return res.status(400).send({ message: "All fields are required!" });
    }

    const user = await User.create({
      username,
      password: bcrypt.hashSync(password, 8),
      role: 'teacher',
      name,
      email,
      uniqueId,
      phoneNumber: phoneNumber || null,
      subject: subject || null,
      salary: salary ? Number(salary) : null
    });

    // Notify Teacher about account creation
    await notificationService.sendEmail(
      email,
      "Welcome to Smart School - Teacher Account Created",
      `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">Welcome, ${name}!</h2>
        <p>Your faculty account has been successfully created by the Administrator.</p>
        <p><strong>Login Details:</strong></p>
        <ul>
          <li>Username: ${username}</li>
          <li>Password: ${password}</li>
        </ul>
        <p>Please log in and update your password immediately.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">This is an automated notification from Smart School Management System.</p>
      </div>`
    );

    res.send({ message: "Teacher added successfully!", teacher: user });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, subject, salary, uniqueId } = req.body;
    
    await User.update({ name, email, phoneNumber, subject, salary, uniqueId }, {
      where: { id, role: 'teacher' }
    });
    
    res.send({ message: "Teacher updated successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const removeTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    await User.destroy({ where: { id, role: 'teacher' } });
    res.send({ message: "Teacher removed successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.findAll({
      where: { role: 'teacher' },
      attributes: ['id', 'username', 'name', 'email', 'uniqueId', 'phoneNumber', 'subject', 'salary']
    });
    res.send(teachers);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'username', 'name', 'email', 'uniqueId', 'phoneNumber', 'class', 'rollNo', 'fatherName']
    });
    res.send(students);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getClassStats = async (req, res) => {
  try {
    const classes = await User.findAll({
      where: { role: 'student' },
      attributes: ['class', [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'studentCount']],
      group: ['class']
    });
    res.send(classes);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getFeesStats = async (req, res) => {
  try {
    const fees = await Fee.findAll({
      include: [{ model: User, attributes: ['name', 'class'] }]
    });
    res.send(fees);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getAttendanceStats = async (req, res) => {
  try {
    const attendance = await Attendance.findAll({
      limit: 100,
      order: [['date', 'DESC']],
      include: [{ model: User, attributes: ['name', 'class'] }]
    });
    res.send(attendance);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      order: [['date', 'DESC']]
    });
    res.send(expenses);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const addExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;
    const expense = await Expense.create({ title, amount, category, date, description });
    res.send({ message: "Expense added successfully!", expense });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const addStudent = async (req, res) => {
  try {
    const { name, fatherName, email, phoneNumber, class: className, username, password } = req.body;
    const user = await User.create({
      name,
      fatherName,
      email,
      phoneNumber,
      class: className,
      username,
      password: bcrypt.hashSync(password, 8),
      role: 'student',
      uniqueId: 'STU' + Date.now()
    });
    res.send({ message: "Student added successfully!", student: user });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fatherName, email, phoneNumber, class: className, rollNo } = req.body;
    await User.update({ name, fatherName, email, phoneNumber, class: className, rollNo }, {
      where: { id, role: 'student' }
    });
    res.send({ message: "Student updated successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const removeStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await User.destroy({ where: { id, role: 'student' } });
    res.send({ message: "Student removed successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getSalaries = async (req, res) => {
  try {
    const salaries = await Salary.findAll({
      include: [{ model: User, attributes: ['name', 'subject', 'salary'] }]
    });
    res.send(salaries);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const paySalary = async (req, res) => {
  try {
    const { teacherId, amount, month, year } = req.body;
    const salary = await Salary.create({
      teacherId,
      amount,
      month,
      year,
      status: 'Paid',
      paymentDate: new Date()
    });
    res.send({ message: "Salary marked as Paid!", salary });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({
      include: [{ model: User, as: 'classTeacher', attributes: ['name'] }]
    });
    res.send(classes);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const addClass = async (req, res) => {
  try {
    const { name, teacherId } = req.body;
    const newClass = await Class.create({ name, teacherId });
    res.send({ message: "Class added successfully!", class: newClass });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, teacherId } = req.body;
    await Class.update({ name, teacherId }, { where: { id } });
    res.send({ message: "Class updated successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    await Class.destroy({ where: { id } });
    res.send({ message: "Class deleted successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const markUserAttendance = async (req, res) => {
  try {
    const { userId, status, date, subject } = req.body;
    const attendance = await Attendance.create({ userId, status, date, subject });
    res.send({ message: "Attendance marked successfully!", attendance });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const addMarks = async (req, res) => {
  try {
    const { studentId, subject, marks, totalMarks, type, teacherId } = req.body;
    const newMark = await Mark.create({ 
      studentId, 
      subject, 
      marksObtained: marks, 
      totalMarks, 
      examType: type, 
      teacherId 
    });
    res.send({ message: "Marks added successfully!", mark: newMark });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getStudentMarks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const marks = await Mark.findAll({ where: { studentId } });
    res.send(marks);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
