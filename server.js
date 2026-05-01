require("dotenv").config(); // must be FIRST line

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug: confirm env vars are loaded
console.log("🔍 MONGO_URI loaded:", process.env.MONGO_URI ? "YES" : "❌ MISSING");
console.log("🔍 EMAIL_USER loaded:", process.env.EMAIL_USER ? "YES" : "❌ MISSING");
console.log("🔍 EMAIL_PASS loaded:", process.env.EMAIL_PASS ? "YES" : "❌ MISSING");

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err.message));

// Routes
app.use("/api/users", require("./routes/userRoutes"));

// Health check route — visit your Render URL to confirm it's running
app.get("/", (req, res) => {
  res.json({
    status: "✅ Server is running",
    mongo: mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Not connected"
  });
});

// Use Render's PORT — hardcoding 5000 breaks deployment on Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
