import db from "../models/index.js";
const Attendance = db.attendance;
const User = db.users;
import * as notificationService from "../services/notification.service.js";

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
};

export const punchIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.userId;
    const role = req.userRole;
    
    // Get local date string YYYY-MM-DD
    const today = new Date().toLocaleDateString('en-CA'); 
    const nowTime = new Date().toLocaleTimeString('en-GB', { hour12: false }); // HH:MM:SS

    // Check if within radius
    const schoolLat = parseFloat(process.env.SCHOOL_LATITUDE);
    const schoolLng = parseFloat(process.env.SCHOOL_LONGITUDE);
    const radius = parseFloat(process.env.SCHOOL_RADIUS) || 100;

    const distance = getDistance(latitude, longitude, schoolLat, schoolLng);

    if (distance > radius) {
      return res.status(403).send({ message: "You are not at school location" });
    }

    // Check if already punched in
    const existing = await Attendance.findOne({ where: { userId, date: today } });
    if (existing && existing.loginTime) {
      return res.status(400).send({ message: "Already punched in for today" });
    }

    const attendance = await Attendance.create({
      userId,
      role,
      date: today,
      loginTime: nowTime,
      latitude,
      longitude,
      status: "present",
    });

    // Notifications
    const user = await User.findByPk(userId, {
      include: [{ model: User, as: 'parent' }]
    });

    if (role === "student" && user.parent) {
      await notificationService.notifyParent(
        user,
        user.parent,
        "Punch In Alert",
        `Your child ${user.name} logged in at ${nowTime}`,
        "attendance"
      );
    } else if (role === "teacher") {
      const admin = await User.findOne({ where: { role: "admin" } });
      if (admin) {
        await notificationService.createNotification(
          admin.id,
          "Teacher Login Alert",
          `Teacher ${user.name} logged in at ${nowTime}`,
          "attendance"
        );
      }
    }

    res.send({ message: "Punched in successfully", attendance });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const punchOut = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.userId;
    const role = req.userRole;
    
    // Get local date string YYYY-MM-DD
    const today = new Date().toLocaleDateString('en-CA');
    const nowTime = new Date().toLocaleTimeString('en-GB', { hour12: false }); // HH:MM:SS

    const attendance = await Attendance.findOne({ where: { userId, date: today } });

    if (!attendance || !attendance.loginTime) {
      return res.status(400).send({ message: "You haven't punched in today" });
    }

    if (attendance.logoutTime) {
      return res.status(400).send({ message: "Already punched out for today" });
    }

    attendance.logoutTime = nowTime;
    await attendance.save();

    // Notifications
    const user = await User.findByPk(userId, {
      include: [{ model: User, as: 'parent' }]
    });

    if (role === "student" && user.parent) {
      await notificationService.notifyParent(
        user,
        user.parent,
        "Punch Out Alert",
        `Your child ${user.name} left school at ${nowTime}`,
        "attendance"
      );
    } else if (role === "teacher") {
      const admin = await User.findOne({ where: { role: "admin" } });
      if (admin) {
        await notificationService.createNotification(
          admin.id,
          "Teacher Logout Alert",
          `Teacher ${user.name} logged out at ${nowTime}`,
          "attendance"
        );
      }
    }

    res.send({ message: "Punched out successfully", attendance });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getAttendanceStatus = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA');
    const attendance = await Attendance.findOne({ where: { userId: req.userId, date: today } });
    res.send(attendance);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
