const db = require("../db");

exports.logEvent = async (email, event, ip = null) => {
  try {
    await db.query(
      "INSERT INTO security_logs(email, event, ip) VALUES($1, $2, $3)",
      [email, event, ip]
    );
  } catch (err) {
    console.error("Log DB error:", err.message);
  }
};