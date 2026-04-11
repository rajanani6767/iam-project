const { Client } = require("pg");
require("dotenv").config();


const db = new Client({

  host: "db.eaygeioafynoluykukbm.supabase.co",

  user: "postgres",

  password: "099009@Raja",

  database: "postgres",

  port: 5432,

  ssl: { rejectUnauthorized: false }

});

db.connect()
  .then(() => console.log("Database Connected ✅"))
  .catch(err => console.log(err));

module.exports = db;