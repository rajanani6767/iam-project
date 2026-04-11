const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS FIX (for GitHub Pages)
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server Running 🚀");
});

// ✅ Render PORT FIX
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});