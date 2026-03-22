import { authJwt } from "../middleware/index.js";
import * as controller from "../controllers/admin.controller.js";

export default function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/admin/stats", [authJwt.verifyToken, authJwt.isAdmin], controller.getStats);
  
  // Teachers
  app.get("/api/admin/teachers", [authJwt.verifyToken, authJwt.isAdmin], controller.getAllTeachers);
  app.post("/api/admin/teachers", [authJwt.verifyToken, authJwt.isAdmin], controller.addTeacher);
  app.put("/api/admin/teachers/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.updateTeacher);
  app.delete("/api/admin/teachers/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.removeTeacher);
  
  // Students
  app.get("/api/admin/students", [authJwt.verifyToken, authJwt.isAdmin], controller.getAllStudents);
  app.post("/api/admin/students", [authJwt.verifyToken, authJwt.isAdmin], controller.addStudent);
  app.put("/api/admin/students/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.updateStudent);
  app.delete("/api/admin/students/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.removeStudent);
  
  // Classes
  app.get("/api/admin/classes-list", [authJwt.verifyToken, authJwt.isAdmin], controller.getClasses);
  app.post("/api/admin/classes", [authJwt.verifyToken, authJwt.isAdmin], controller.addClass);
  app.put("/api/admin/classes/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.updateClass);
  app.delete("/api/admin/classes/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.deleteClass);
  app.get("/api/admin/classes-stats", [authJwt.verifyToken, authJwt.isAdmin], controller.getClassStats);
  
  // Finance & Salaries
  app.get("/api/admin/salaries", [authJwt.verifyToken, authJwt.isAdmin], controller.getSalaries);
  app.post("/api/admin/pay-salary", [authJwt.verifyToken, authJwt.isAdmin], controller.paySalary);
  app.get("/api/admin/expenses", [authJwt.verifyToken, authJwt.isAdmin], controller.getExpenses);
  app.post("/api/admin/expenses", [authJwt.verifyToken, authJwt.isAdmin], controller.addExpense);
  app.get("/api/admin/fees-stats", [authJwt.verifyToken, authJwt.isAdmin], controller.getFeesStats);
  
  // Attendance & Marks
  app.post("/api/admin/mark-attendance", [authJwt.verifyToken, authJwt.isAdmin], controller.markUserAttendance);
  app.get("/api/admin/attendance-stats", [authJwt.verifyToken, authJwt.isAdmin], controller.getAttendanceStats);
  app.post("/api/admin/add-marks", [authJwt.verifyToken, authJwt.isAdmin], controller.addMarks);
  app.get("/api/admin/student-marks/:studentId", [authJwt.verifyToken, authJwt.isAdmin], controller.getStudentMarks);
};
