import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import donationRoutes from "./routes/donations.js";
import driveRoutes from "./routes/drives.js";
import requestRoutes from "./routes/requests.js";
import adminRoutes from "./routes/admin.js";

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// ✅ CORS (IMPORTANT)
// --------------------
app.use(
  cors({
    origin: [
      "https://share-bloom.vercel.app",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// Handle preflight requests
app.options("*", cors());

// --------------------
// Middlewares
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------
// MongoDB
// --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --------------------
// Routes
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/drives", driveRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);

// --------------------
// Health check
// --------------------
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running!",
    time: new Date().toISOString()
  });
});

// --------------------
// Error handler
// --------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message
  });
});

// --------------------
// 404 handler
// --------------------
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// --------------------
// Start server
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
