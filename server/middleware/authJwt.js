import jwt from "jsonwebtoken";
import db from "../models/index.js";
const User = db.users;
import dotenv from 'dotenv';
dotenv.config();

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.userRole === "admin") {
    next();
    return;
  }
  res.status(403).send({ message: "Require Admin Role!" });
};

const isTeacher = (req, res, next) => {
  if (req.userRole === "teacher" || req.userRole === "admin") {
    next();
    return;
  }
  res.status(403).send({ message: "Require Teacher Role!" });
};

const isStudent = (req, res, next) => {
  if (req.userRole === "student" || req.userRole === "admin") {
    next();
    return;
  }
  res.status(403).send({ message: "Require Student Role!" });
};

const isParent = (req, res, next) => {
  if (req.userRole === "parent" || req.userRole === "admin") {
    next();
    return;
  }
  res.status(403).send({ message: "Require Parent Role!" });
};

const authJwt = {
  verifyToken,
  isAdmin,
  isTeacher,
  isStudent,
  isParent
};

export default authJwt;
