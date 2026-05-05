const db = require("../db");

exports.logEvent = async (email, event, ip = null) => {
  try {
    console.log("LOGGING:", email, event); // debug

    await db.query(
      "INSERT INTO security_logs(email, event, ip) VALUES($1,$2,$3)",
      [email, event, ip]
    );

    console.log("LOG SAVED ✅");
  } catch (err) {
    console.error("LOG ERROR ❌:", err.message);
  }
};