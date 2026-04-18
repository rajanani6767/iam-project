const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const verifyToken = require("../middleware/authMiddleware");

// OTP STORE
let otpStore = {};

// PASSWORD VALIDATION
const strongPassword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!strongPassword.test(password)) {
    return res.json({ message: "Weak Password ❌" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username.toLowerCase(), hashedPassword]
    );

    res.json({ message: "User Registered ✅" });

  } catch (err) {
    console.log(err);
    res.json({ message: "Error ❌" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE username=$1",
      [username.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.json({ message: "User Not Found ❌" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ message: "Invalid Password ❌" });
    }

    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token: token
    });

  } catch (err) {
    console.log(err);
    res.json({ message: "Server Error ❌" });
  }
});

// ================= PROTECTED =================
router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: `Welcome ${req.user.username} 🔐`
  });
});

// ================= OTP =================
router.post("/send-otp", (req, res) => {
  const { username } = req.body;

  const otp = Math.floor(1000 + Math.random() * 9000);
  otpStore[username] = otp;

  res.json({
    message: "OTP sent (demo)",
    demoOtp: otp
  });
});

// ================= RESET =================
router.post("/reset-password", async (req, res) => {
  const { username, otp, newPassword } = req.body;

  if (otpStore[username] != otp) {
    return res.json({ message: "Invalid OTP ❌" });
  }

  if (!strongPassword.test(newPassword)) {
    return res.json({ message: "Weak Password ❌" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.query(
    "UPDATE users SET password=$1 WHERE username=$2",
    [hashedPassword, username.toLowerCase()]
  );

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