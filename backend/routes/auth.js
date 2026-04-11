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
    return res.send("Weak Password ❌");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, hashedPassword]
    );

    res.send("User Registered ✅");
  } catch (err) {
    res.send(err.message);
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
      return res.send("User Not Found ❌");
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.send("Invalid Password ❌");
    }

    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login Success ✅",
      token
    });

  } catch (err) {
    res.send(err.message);
  }
});

// ================= SEND OTP (DEMO MODE) =================
router.post("/send-otp", (req, res) => {
  const { username } = req.body;

  const otp = Math.floor(1000 + Math.random() * 9000);
  otpStore[username] = otp;

  res.json({
    message: "OTP sent (demo mode)",
    demoOtp: otp
  });
});

// ================= VERIFY OTP =================
router.post("/verify-otp", (req, res) => {
  const { username, otp } = req.body;

  if (otpStore[username] == otp) {
    res.send("OTP Verified ✅");
  } else {
    res.send("Invalid OTP ❌");
  }
});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  const { username, otp, newPassword } = req.body;

  if (otpStore[username] != otp) {
    return res.send("Invalid OTP ❌");
  }

  if (!strongPassword.test(newPassword)) {
    return res.send("Weak Password ❌");
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password=$1 WHERE username=$2",
      [hashedPassword, username]
    );

    res.send("Password Reset Successful ✅");

  } catch (err) {
    res.send(err.message);
  }
});

module.exports = router;