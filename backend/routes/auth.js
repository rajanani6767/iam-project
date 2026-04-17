const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
      [username, hashedPassword]
    );

    res.json({ message: "User Registered ✅" });
  } catch (err) {
    res.json({ message: err.message });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
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
      { username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login Success ✅",
      token,
    });

  } catch (err) {
    res.json({ message: err.message });
  }
});

// ================= SEND OTP =================
router.post("/send-otp", (req, res) => {
  const { username } = req.body;

  const otp = Math.floor(1000 + Math.random() * 9000);
  otpStore[username] = otp;

  res.json({
    message: "OTP sent (demo mode)",
    demoOtp: otp,
  });
});

// ================= VERIFY OTP =================
router.post("/verify-otp", (req, res) => {
  const { username, otp } = req.body;

  if (otpStore[username] == otp) {
    res.json({ message: "OTP Verified ✅" });
  } else {
    res.json({ message: "Invalid OTP ❌" });
  }
});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  const { username, otp, newPassword } = req.body;

  if (otpStore[username] != otp) {
    return res.json({ message: "Invalid OTP ❌" });
  }

  if (!strongPassword.test(newPassword)) {
    return res.json({ message: "Weak Password ❌" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password=$1 WHERE username=$2",
      [hashedPassword, username]
    );

    res.json({ message: "Password Reset Successful ✅" });

  } catch (err) {
    res.json({ message: err.message });
  }
});

// ================= PASSWORD GENERATOR =================
router.get("/generate-password", (req, res) => {
  const length = parseInt(req.query.length) || 12;

  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "@$!%*?&";

  const all = lower + upper + numbers + symbols;

  let password = "";

  // ensure strong password
  password += lower[Math.floor(Math.random() * lower.length)];
  password += upper[Math.floor(Math.random() * upper.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // shuffle
  password = password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  res.json({ password });
});

module.exports = router;