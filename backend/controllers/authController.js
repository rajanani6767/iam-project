const service = require("../services/authService");
const logger = require("../utils/logger");

// ✅ NEW: DB logger
const { logEvent } = require("../utils/securityLogger");

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    await service.registerUser(req.body.username, req.body.password);

    // 🔥 LOG SUCCESS (DB)
    await logEvent(req.body.username, "register_success");

    res.status(201).json({ message: "User Registered ✅" });
  } catch (err) {
    logger.error(err.message);

    // 🔥 LOG FAILURE (DB)
    await logEvent(req.body.username, "register_failed");

    res.status(400).json({ message: err.message });
  }
};

// ================= LOGIN =================
const service = require("../services/authService");
const logger = require("../utils/logger");

// ✅ NEW: DB logger
const { logEvent } = require("../utils/securityLogger");

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    await service.registerUser(req.body.username, req.body.password);

    // 🔥 LOG SUCCESS (DB)
    await logEvent(req.body.username, "register_success");

    res.status(201).json({ message: "User Registered ✅" });
  } catch (err) {
    logger.error(err.message);

    // 🔥 LOG FAILURE (DB)
    await logEvent(req.body.username, "register_failed");

    res.status(400).json({ message: err.message });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  console.log("➡️ BODY:", req.body);

  const user = req.body.username || req.body.email;

  try {
    const { accessToken, refreshToken } =
      await service.loginUser(user, req.body.password);

    console.log("✅ LOGIN SUCCESS:", user);

    await logEvent(user, "login_success");

    res.json({ message: "Login Success ✅" });

  } catch (err) {
    console.log("❌ LOGIN FAILED:", user, err.message);

    await logEvent(user || "unknown_user", "login_failed");

    res.status(401).json({ message: err.message });
  }
};