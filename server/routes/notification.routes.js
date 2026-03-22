import { authJwt } from "../middleware/index.js";
import * as controller from "../controllers/notification.controller.js";

export default function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/notifications", [authJwt.verifyToken], controller.getNotifications);
  app.put("/api/notifications/:id/read", [authJwt.verifyToken], controller.markAsRead);
};
