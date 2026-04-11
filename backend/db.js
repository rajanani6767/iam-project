const { Client } = require("pg");
require("dotenv").config();

const db = new Client({
  host: "db.eaygeioafynoluykukbm.supabase.co",
  port: 5432,
  user: "postgres",
  password: "099009@Raja",   // 🔥 your original password (NOT encoded)
  database: "postgres",
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

db.connect()
  .then(() => console.log("Database Connected ✅"))
  .catch(err => console.log("DB ERROR 👉", err));

module.exports = db;