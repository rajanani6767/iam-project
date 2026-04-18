const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

require("dotenv").config();

const app = express();

// SECURITY
app.use(helmet());

// 🔥 IMPORTANT CORS (CHANGE FRONTEND URL)
app.use(cors({
  origin: "https://rajanani6767.github.io", // ✅ YOUR REAL FRONTEND
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// RATE LIMIT
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// ROUTES
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// HOME
app.get("/", (req, res) => {
  res.send("Server Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});