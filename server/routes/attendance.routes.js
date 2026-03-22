import { authJwt } from "../middleware/index.js";
import * as controller from "../controllers/attendance.controller.js";

export default function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/attendance/punch-in", [authJwt.verifyToken], controller.punchIn);
  app.post("/api/attendance/punch-out", [authJwt.verifyToken], controller.punchOut);
  app.get("/api/attendance/status", [authJwt.verifyToken], controller.getAttendanceStatus);
};
