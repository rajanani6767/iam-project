const { Client } = require("pg");
require("dotenv").config();

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

db.connect()
  .then(() => console.log("Database Connected ✅"))
  .catch(err => console.log("DB ERROR 👉", err));

module.exports = db;