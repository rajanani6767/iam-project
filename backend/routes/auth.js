const express = require("express");
const router = express.Router();

const controller = require("../controllers/authController");
const { body } = require("express-validator");
const { validate } = require("../middleware/validateMiddleware");
const verifyToken = require("../middleware/authMiddleware");

// TEMP OTP STORE (demo only)
let otpStore = {};

// ================= REGISTER =================
router.post(
  "/register",
  [
    body("username").isEmail(),
    body("password").isLength({ min: 8 })
  ],
  validate,
  controller.register
);

// ================= LOGIN =================
router.post("/login", controller.login);

// ================= DASHBOARD =================
router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: `Welcome ${req.user.username} 🔐`
  });
});

// ================= LOGOUT =================
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });

  res.json({ message: "Logged out ✅" });
});

// ================= SEND OTP =================
router.post("/send-otp", (req, res) => {
  const { username } = req.body;

  const otp = Math.floor(1000 + Math.random() * 9000);
  otpStore[username] = otp;

  res.json({
    message: "OTP sent (demo)",
    demoOtp: otp
  });
});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  const { username, otp, newPassword } = req.body;

  if (otpStore[username] != otp) {
    return res.status(400).json({ message: "Invalid OTP ❌" });
  }

  const bcrypt = require("bcrypt");
  const db = require("../db");

  const hashed = await bcrypt.hash(newPassword, 10);

  await db.query(
    "UPDATE users SET password=$1 WHERE username=$2",
    [hashed, username]
  );

  delete otpStore[username];

  res.json({ message: "Password Reset Successful ✅" });
});

// ================= PASSWORD GENERATOR =================
router.get("/generate-password", (req, res) => {
  const length = parseInt(req.query.length) || 12;

  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&";

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  res.json({ password });
});

module.exports = router;