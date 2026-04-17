const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");

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

// ================= AI ASSISTANT (FINAL) =================
router.post("/ai-help", async (req, res) => {
  const message = req.body.message?.toLowerCase() || "";

  try {
    // 🔹 Try HuggingFace first
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
      { inputs: message },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
        timeout: 5000 // avoid long wait
      }
    );

    let reply = "No response";

    if (Array.isArray(response.data)) {
      reply = response.data[0]?.generated_text || reply;
    } else if (response.data.generated_text) {
      reply = response.data.generated_text;
    }

    if (!reply || reply === "No response") {
      throw new Error("Empty HF response");
    }

    return res.json({ reply });

  } catch (err) {
    console.log("HF ERROR 👉", err.message);

    // 🔥 FALLBACK AI (always works)
    if (message.includes("password")) {
      return res.json({
        reply: "Password must include uppercase, lowercase, number and special character."
      });
    }

    if (message.includes("otp")) {
      return res.json({
        reply: "OTP is a one-time password used to verify your identity."
      });
    }

    if (message.includes("login")) {
      return res.json({
        reply: "Check your username and password. Make sure they are correct."
      });
    }

    if (message.includes("jwt")) {
      return res.json({
        reply: "JWT is a token used for secure authentication between client and server."
      });
    }

    // Default fallback
    return res.json({
      reply: "AI is currently busy. Please try again later."
    });
  }
});

module.exports = router;