import db from "../models/index.js";
const User = db.users;
const Attendance = db.attendance;
const Fee = db.fees;
const Notice = db.notices;
const Notification = db.notifications;
import * as pdfService from "../services/pdf.service.js";

export const downloadReceipt = async (req, res) => {
  try {
    const student = await User.findOne({
      where: { id: req.params.studentId, parentId: req.userId },
      include: [{ model: Fee }]
    });

    if (!student || !student.fee) {
      return res.status(404).send({ message: "Receipt not found" });
    }

    const pdfBuffer = await pdfService.generateFeeReceipt(student, student.fee);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt_${student.name.replace(/\s+/g, '_')}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });
    res.send(notifications);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, {
      where: { id: req.params.id, userId: req.userId }
    });
    res.send({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getParentDashboard = async (req, res) => {
  try {
    const parentId = req.userId;
    const children = await User.findAll({
      where: { parentId, role: 'student' },
      include: [
        { model: Fee },
        { model: User, as: 'teacher', attributes: ['name'] }
      ]
    });

    const childrenData = await Promise.all(children.map(async (child) => {
      const totalDays = await Attendance.count({ where: { userId: child.id } });
      const presentDays = await Attendance.count({ where: { userId: child.id, status: 'present' } });
      const absentDays = await Attendance.count({ where: { userId: child.id, status: 'absent' } });
      const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      const subjects = child.subjects || [];
      const subjectWise = {};
      for (const sub of subjects) {
        const subTotal = await Attendance.count({ where: { userId: child.id, subject: sub } });
        const subPresent = await Attendance.count({ where: { userId: child.id, status: 'present', subject: sub } });
        subjectWise[sub] = subTotal > 0 ? ((subPresent / subTotal) * 100).toFixed(2) : 0;
      }

      const marks = await db.marks.findAll({
        where: { studentId: child.id },
        order: [['createdAt', 'DESC']]
      });

      return {
        id: child.id,
        name: child.name,
        class: child.class,
        rollNo: child.rollNo,
        uniqueId: child.uniqueId,
        email: child.email,
        totalDays,
        presentDays,
        absentDays,
        attendancePercentage: attendancePercentage.toFixed(2),
        subjectWise,
        fee: child.fee,
        teacher: child.teacher,
        marks
      };
    }));

    res.send({ children: childrenData });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.findAll({
      order: [['date', 'DESC']],
      include: [{ model: User, attributes: ['name'] }]
    });
    res.send(notices);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
