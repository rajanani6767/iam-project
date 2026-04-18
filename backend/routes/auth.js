const express = require("express");
const router = express.Router();

const controller = require("../controllers/authController");
const { body } = require("express-validator");
const { validate } = require("../middleware/validateMiddleware");
const verifyToken = require("../middleware/authMiddleware");

// REGISTER
router.post(
  "/register",
  [
    body("username").isEmail(),
    body("password").isLength({ min: 8 })
  ],
  validate,
  controller.register
);

// LOGIN
router.post("/login", controller.login);

// DASHBOARD
router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: `Welcome ${req.user.username} 🔐`
  });
});

// LOGOUT
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

  res.status(200).json({ message: "Logged out successfully ✅" });
});

module.exports = router;