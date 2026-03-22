import { authJwt } from "../middleware/index.js";
import * as controller from "../controllers/student.controller.js";

export default function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/student/dashboard", [authJwt.verifyToken, authJwt.isStudent], controller.getStudentDashboard);
  app.post("/api/student/attendance", [authJwt.verifyToken, authJwt.isStudent], controller.markSelfAttendance);
};
