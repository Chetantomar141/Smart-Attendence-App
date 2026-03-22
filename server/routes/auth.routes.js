import { verifySignUp, authJwt } from "../middleware/index.js";
import * as controller from "../controllers/auth.controller.js";
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
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail
    ],
    controller.signup
  );

  app.post("/api/auth/signin", controller.signin);

  app.put(
    "/api/auth/profile",
    [authJwt.verifyToken, upload.single("profilePhoto")],
    controller.updateProfile
  );
};
