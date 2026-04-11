const { Client } = require("pg");
require("dotenv").config();

const db = new Client({
  connectionString: process.env.DATABASE_URL, // ✅ Render style
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect()
  .then(() => console.log("Database Connected ✅"))
  .catch(err => console.log(err));

module.exports = db;