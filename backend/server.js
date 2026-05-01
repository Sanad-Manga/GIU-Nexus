require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dns = require('dns');

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const errorHandler = require("./middleware/ErrorHandler");

// Set custom DNS servers
// Prefer reliable public DNS for SRV lookups (helps when local DNS/VPN blocks SRV)
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

// Centralized error handling middleware (must be last)
app.use(errorHandler);

// Start server after DB connects
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});