require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const mongoose = require("mongoose");
const dns = require("dns");

// Import routes
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Import error handler
const errorHandler = require("./middleware/ErrorHandler");

// Set custom DNS servers
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

// Security middleware — must come before routes
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// MongoDB connection
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Routes
app.get("/", (_req, res) => {
  res.json({ message: "GIU-Nexus API is running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server after DB connects
const PORT = process.env.PORT || 5000;
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});