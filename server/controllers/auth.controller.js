import db from "../models/index.js";
const User = db.users;
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
dotenv.config();

export const signup = async (req, res) => {
  try {
    const { username, password, role, name, email, uniqueId, teacherId } = req.body;
    
    const user = await User.create({
      username,
      password: bcrypt.hashSync(password, 8),
      role,
      name,
      email,
      uniqueId,
      teacherId
    });

    res.send({ message: "User was registered successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const signin = async (req, res) => {
  try {
    console.log("[AUTH] Login attempt for username:", req.body.username);
    const user = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (!user) {
      console.log("[AUTH] User not found:", req.body.username);
      return res.status(404).send({ message: "User Not found." });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      console.log("[AUTH] Invalid password for user:", req.body.username);
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!"
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    console.log("[AUTH] Login successful for user:", req.body.username, "Role:", user.role);
    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      uniqueId: user.uniqueId,
      profilePhoto: user.profilePhoto,
      accessToken: token
    });
  } catch (err) {
    console.error("[AUTH] Login error:", err);
    res.status(500).send({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    const profilePhoto = req.file ? req.file.filename : undefined;

    const updateData = { name, email, phoneNumber };
    if (profilePhoto) updateData.profilePhoto = profilePhoto;

    await User.update(updateData, { where: { id: req.userId } });

    const updatedUser = await User.findByPk(req.userId);
    res.send({ message: "Profile updated successfully!", user: updatedUser });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
