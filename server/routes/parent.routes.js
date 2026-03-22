import { authJwt } from "../middleware/index.js";
import * as controller from "../controllers/parent.controller.js";

export default function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/parent/dashboard", [authJwt.verifyToken, authJwt.isParent], controller.getParentDashboard);
  app.get("/api/parent/notices", [authJwt.verifyToken, authJwt.isParent], controller.getNotices);
  app.get("/api/parent/notifications", [authJwt.verifyToken, authJwt.isParent], controller.getNotifications);
  app.put("/api/parent/notifications/:id/read", [authJwt.verifyToken, authJwt.isParent], controller.markAsRead);
  app.get("/api/parent/fees/:studentId/receipt", [authJwt.verifyToken, authJwt.isParent], controller.downloadReceipt);
};
