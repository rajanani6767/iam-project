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
  try {
    const { accessToken, refreshToken } =
      await service.loginUser(req.body.username, req.body.password);

    // 🔥 LOG SUCCESS (DB)
    await logEvent(req.body.username, "login_success");

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });

    res.json({ message: "Login Success ✅" });
  } catch (err) {
    logger.error(err.message);

    // 🔥 LOG FAILED LOGIN (IMPORTANT)
    await logEvent(req.body.username, "login_failed");

    res.status(401).json({ message: err.message });
  }
};