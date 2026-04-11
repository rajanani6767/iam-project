const { Client } = require("pg");
require("dotenv").config(); // safe to keep

console.log("ENV DB 👉", process.env.DATABASE_URL); // debug

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