const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

// ✅ FIXED ROUTES
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Server Running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});