require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const ErrorHandler = require("./middleware/ErrorHandler");

// Set custom DNS servers (Google and Cloudflare)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MongoDB connection function (with retry logic)
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit the process on connection error
  }
};

// Call the connectDatabase function
connectDatabase();

// Routes
app.get("/", (_req, res) => {
  res.json({ message: "GIU-Nexus API is running" });
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message: message,
  });
});
app.use(ErrorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});