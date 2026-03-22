import { authJwt } from "../middleware/index.js";
import * as controller from "../controllers/notice.controller.js";
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
    "/api/notices",
    [authJwt.verifyToken, authJwt.isTeacher, upload.single("attachment")],
    controller.createNotice
  );

  app.get("/api/notices", [authJwt.verifyToken], controller.getAllNotices);

  app.delete(
    "/api/notices/:id",
    [authJwt.verifyToken, authJwt.isTeacher],
    controller.deleteNotice
  );
};
