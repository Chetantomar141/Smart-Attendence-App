import { authJwt } from "../middleware/index.js";
import * as controller from "../controllers/assignment.controller.js";
import upload from "../middleware/upload.js";

export default function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/assignments",
    [authJwt.verifyToken, authJwt.isTeacher, upload.single("attachment")],
    controller.createAssignment
  );

  app.get(
    "/api/assignments/teacher",
    [authJwt.verifyToken, authJwt.isTeacher],
    controller.getTeacherAssignments
  );

  app.get(
    "/api/assignments/student",
    [authJwt.verifyToken, authJwt.isStudent],
    controller.getStudentAssignments
  );

  app.post(
    "/api/assignments/:assignmentId/submit",
    [authJwt.verifyToken, authJwt.isStudent, upload.single("attachment")],
    controller.submitAssignment
  );

  app.put(
    "/api/submissions/:id/grade",
    [authJwt.verifyToken, authJwt.isTeacher],
    controller.gradeSubmission
  );
};
