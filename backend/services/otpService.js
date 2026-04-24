const db = require("../db");
const bcrypt = require("bcrypt");

// ================= SAVE OTP (HASHED + SINGLE ACTIVE) =================
exports.saveOtp = async (email, otp) => {
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  const hashedOtp = await bcrypt.hash(otp, 10);

  // 🔥 DELETE OLD OTPs (important)
  await db.query("DELETE FROM otps WHERE email=$1", [email]);

  // INSERT NEW OTP
  await db.query(
    "INSERT INTO otps(email, otp, expires_at) VALUES($1,$2,$3)",
    [email, hashedOtp, expires]
  );
};

// ================= VERIFY OTP =================
exports.verifyOtp = async (email, otp) => {
  const result = await db.query(
    "SELECT * FROM otps WHERE email=$1 ORDER BY id DESC LIMIT 1",
    [email]
  );

  if (result.rows.length === 0) return false;

  const record = result.rows[0];

  // ❌ EXPIRED → DELETE
  if (new Date(record.expires_at) < new Date()) {
    await db.query("DELETE FROM otps WHERE email=$1", [email]);
    return false;
  }

  const match = await bcrypt.compare(otp, record.otp);

  if (!match) return false;

  // 🔥 DELETE AFTER SUCCESS (ONE-TIME USE)
  await db.query("DELETE FROM otps WHERE email=$1", [email]);

  return true;
};