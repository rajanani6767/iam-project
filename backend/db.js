const { Client } = require("pg");
require("dotenv").config();

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
  family: 4   // 🔥 FORCE IPv4 (THIS FIXES YOUR ERROR)
});

db.connect()
  .then(() => console.log("Database Connected ✅"))
  .catch(err => console.log("DB ERROR 👉", err));

module.exports = db;