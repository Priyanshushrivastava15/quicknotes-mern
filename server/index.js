// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

// Initialize App
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// Root Route
app.get("/", (req, res) => {
  res.json({ message: "QuickNotes Backend is Running 🚀" });
});

// Health Check
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));