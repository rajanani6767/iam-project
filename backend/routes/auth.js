const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

// ✅ NEW IMPORTS
const { saveOtp, verifyOtp } = require("../services/otpService");
const { sendOtpEmail } = require("../services/emailService");

// ================= REGISTER =================
router.post(
  "/register",
  [
    body("username")
      .isEmail()
      .withMessage("Enter valid email like user@example.com ❌"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters ❌"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const checkUser = await db.query(
        "SELECT * FROM users WHERE username=$1",
        [username]
      );

      if (checkUser.rows.length > 0) {
        return res.status(400).json({
          message: "User already exists ❌"
        });
      }

      const hashed = await bcrypt.hash(password, 10);

      await db.query(
        "INSERT INTO users(username,password) VALUES($1,$2)",
        [username, hashed]
      );

      res.status(201).json({
        message: "User Registered ✅"
      });

    } catch (err) {
      res.status(500).json({ message: "Server error ❌" });
    }
  }
);

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found ❌" });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid password ❌" });
    }

    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });

    res.json({ message: "Login Success ✅" });

  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ================= DASHBOARD =================
router.get("/dashboard", (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized ❌" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: `Welcome ${decoded.username} 🔐` });
  } catch {
    res.status(403).json({ message: "Invalid token ❌" });
  }
});

// ================= SEND OTP (NEW) =================
router.post("/send-otp", async (req, res) => {
  const { username } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await saveOtp(username, otp);
    await sendOtpEmail(username, otp);

    res.json({ message: "OTP sent to your email ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP ❌" });
  }
});

// ================= RESET PASSWORD (NEW) =================
router.post("/reset-password", async (req, res) => {
  const { username, otp, newPassword } = req.body;

  const valid = await verifyOtp(username, otp);

  if (!valid) {
    return res.status(400).json({ message: "Invalid or expired OTP ❌" });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password=$1 WHERE username=$2",
      [hashed, username]
    );

    res.json({ message: "Password reset successful ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ================= PASSWORD GENERATOR =================
router.get("/generate-password", (req, res) => {
  let length = parseInt(req.query.length) || 12;

  if (length < 8) length = 8;
  if (length > 32) length = 32;

  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&";

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  res.json({ password });
});

module.exports = router;