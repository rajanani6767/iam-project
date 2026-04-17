const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const OpenAI = require("openai");

// ================= OPENAI =================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// ================= AI ASSISTANT =================
router.post("/ai-help", async (req, res) => {
  const { message } = req.body;

  try {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an authentication assistant for a web app.

Help users with:
- login issues
- password rules
- OTP verification
- JWT explanation

Keep answers short and simple.
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.json({
      reply: aiResponse.choices[0].message.content,
    });

  } catch (err) {
    console.log("AI ERROR 👉", err);

    // ✅ FIXED (ALWAYS JSON)
    res.status(500).json({
      reply: "AI failed ❌",
    });
  }
});

module.exports = router;