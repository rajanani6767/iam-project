const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (username, password) => {
  const check = await db.query(
    "SELECT * FROM users WHERE username=$1",
    [username]
  );

  if (check.rows.length > 0) {
    throw new Error("User already exists ❌");
  }

  const hashed = await bcrypt.hash(password, 10);

  await db.query(
    "INSERT INTO users(username,password) VALUES($1,$2)",
    [username, hashed]
  );
};

exports.loginUser = async (username, password) => {
  const result = await db.query(
    "SELECT * FROM users WHERE username=$1",
    [username]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found ❌");
  }

  const user = result.rows[0];

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error("Invalid password ❌");
  }

  const accessToken = jwt.sign(
    { username },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { username },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};