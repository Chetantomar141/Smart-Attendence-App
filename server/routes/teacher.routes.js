import { authJwt } from "../middleware/index.js";
import * as controller from "../controllers/teacher.controller.js";
import upload from "../middleware/upload.js";

export default function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/teacher/students", [authJwt.verifyToken, authJwt.isTeacher], controller.getTeacherStudents);
  app.get("/api/teacher/stats", [authJwt.verifyToken, authJwt.isTeacher], controller.getTeacherStats);
  app.post("/api/teacher/students", [authJwt.verifyToken, authJwt.isTeacher], controller.addStudent);
  app.put("/api/teacher/students/:id", [authJwt.verifyToken, authJwt.isTeacher], controller.updateStudent);
  app.delete("/api/teacher/students/:id", [authJwt.verifyToken, authJwt.isTeacher], controller.deleteStudent);
  app.post("/api/teacher/attendance", [authJwt.verifyToken, authJwt.isTeacher], controller.markStudentAttendance);
  app.post("/api/teacher/fees", [authJwt.verifyToken, authJwt.isTeacher], controller.updateStudentFees);
  app.get("/api/teacher/attendance-history/:studentId", [authJwt.verifyToken, authJwt.isTeacher], controller.getAttendanceHistory);
  app.get("/api/teacher/export-attendance/:studentId", [authJwt.verifyToken, authJwt.isTeacher], controller.exportAttendance);
  app.post("/api/teacher/upload-students", [authJwt.verifyToken, authJwt.isTeacher, upload.single("file")], controller.bulkAddStudents);
  
  // New Student Management Routes
  app.get("/api/teacher/classes", [authJwt.verifyToken, authJwt.isTeacher], controller.getTeacherClasses);
  app.post("/api/teacher/marks", [authJwt.verifyToken, authJwt.isTeacher], controller.addMarks);
  app.get("/api/teacher/marks/:studentId", [authJwt.verifyToken, authJwt.isTeacher], controller.getStudentMarks);
};
