const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// ✅ FIXED CORS (IMPORTANT)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://rajanani6767.github.io"  // 🔥 ADD THIS
  ],
  credentials: true
}));

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Server Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});