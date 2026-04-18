const service = require("../services/authService");
const logger = require("../utils/logger");

exports.register = async (req, res) => {
  try {
    await service.registerUser(req.body.username, req.body.password);
    res.status(201).json({ message: "User Registered ✅" });
  } catch (err) {
    logger.error(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { accessToken, refreshToken } =
      await service.loginUser(req.body.username, req.body.password);

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
    res.status(401).json({ message: err.message });
  }
};