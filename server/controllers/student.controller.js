import db from "../models/index.js";
const User = db.users;
const Attendance = db.attendance;
const Fee = db.fees;
import { Op } from "sequelize";

export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId, {
      include: [
        { model: User, as: 'teacher', attributes: ['name', 'uniqueId'] },
        { model: Fee }
      ]
    });

    const totalDays = await Attendance.count({ where: { userId } });
    const presentDays = await Attendance.count({ where: { userId, status: 'present' } });
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Subject-wise breakdown
    const subjects = Array.isArray(user.subjects) ? user.subjects : [];
    const subjectWise = {};
    for (const sub of subjects) {
      const subTotal = await Attendance.count({ where: { userId, subject: sub } });
      const subPresent = await Attendance.count({ where: { userId, status: 'present', subject: sub } });
      subjectWise[sub] = subTotal > 0 ? ((subPresent / subTotal) * 100).toFixed(2) : 0;
    }

    const history = await Attendance.findAll({
      where: { userId },
      order: [['date', 'DESC']],
      limit: 20
    });

    const marks = await db.marks.findAll({
      where: { studentId: userId },
      order: [['createdAt', 'DESC']]
    });

    res.send({
      user,
      attendancePercentage: attendancePercentage.toFixed(2),
      subjectWise,
      history,
      fee: user.fee,
      marks
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const markSelfAttendance = async (req, res) => {
  try {
    const { lat, lng, date } = req.body;
    const userId = req.userId;

    // Check if attendance already marked
    const existing = await Attendance.findOne({
      where: { userId, date }
    });

    if (existing) {
      return res.status(400).send({ message: "Attendance already marked for today!" });
    }

    // Predefined location check (e.g., School location: lat: 28.6139, lng: 77.2090 for Delhi)
    const SCHOOL_LAT = 28.6139; 
    const SCHOOL_LNG = 77.2090;
    const ALLOWED_RADIUS = 100; // in meters

    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371e3; // metres
      const φ1 = lat1 * Math.PI/180;
      const φ2 = lat2 * Math.PI/180;
      const Δφ = (lat2-lat1) * Math.PI/180;
      const Δλ = (lon2-lon1) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c; // in metres
    }

    const distance = getDistance(lat, lng, SCHOOL_LAT, SCHOOL_LNG);

    if (distance > ALLOWED_RADIUS) {
      return res.status(403).send({ message: "You are not in the school area!" });
    }

    await Attendance.create({
      userId,
      date,
      status: 'present',
      lat,
      lng
    });

    res.send({ message: "Attendance marked successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
