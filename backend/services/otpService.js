const db = require("../db");

exports.saveOtp = async (email, otp) => {
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  await db.query(
    "INSERT INTO otps(email, otp, expires_at) VALUES($1,$2,$3)",
    [email, otp, expires]
  );
};

exports.verifyOtp = async (email, otp) => {
  const result = await db.query(
    "SELECT * FROM otps WHERE email=$1 AND otp=$2 ORDER BY id DESC LIMIT 1",
    [email, otp]
  );

  if (result.rows.length === 0) return false;

  const record = result.rows[0];

  if (new Date(record.expires_at) < new Date()) return false;

  return true;
};