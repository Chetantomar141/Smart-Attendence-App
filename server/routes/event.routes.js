import { authJwt } from "../middleware/index.js";
import * as controller from "../controllers/event.controller.js";
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
    "/api/events",
    [authJwt.verifyToken, authJwt.isTeacher, upload.single("attachment")],
    controller.createEvent
  );

  app.get("/api/events", [authJwt.verifyToken], controller.getAllEvents);

  app.delete(
    "/api/events/:id",
    [authJwt.verifyToken, authJwt.isTeacher],
    controller.deleteEvent
  );
};
