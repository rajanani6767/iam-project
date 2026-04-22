const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// ✅ MIDDLEWARE
app.use(express.json());
app.use(cookieParser());

// ✅ FINAL CORS FIX (WORKS FOR GITHUB + LOCAL + RENDER)
const allowedOrigins = [
  "http://localhost:5173",
  "https://rajanani6767.github.io"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed: " + origin));
    }
  },
  credentials: true
}));

// ✅ HANDLE PREFLIGHT (VERY IMPORTANT)
app.options("*", cors());

// ✅ ROUTES
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Server Running 🚀");
});

// ✅ PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});