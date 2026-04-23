const db = require("../db");
const bcrypt = require("bcrypt");

// SAVE OTP (HASHED)
exports.saveOtp = async (email, otp) => {
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  const hashedOtp = await bcrypt.hash(otp, 10);

  await db.query(
    "INSERT INTO otps(email, otp, expires_at) VALUES($1,$2,$3)",
    [email, hashedOtp, expires]
  );
};

// VERIFY OTP
exports.verifyOtp = async (email, otp) => {
  const result = await db.query(
    "SELECT * FROM otps WHERE email=$1 ORDER BY id DESC LIMIT 1",
    [email]
  );

  if (result.rows.length === 0) return false;

  const record = result.rows[0];

  if (new Date(record.expires_at) < new Date()) return false;

  const match = await bcrypt.compare(otp, record.otp);

  return match;
};