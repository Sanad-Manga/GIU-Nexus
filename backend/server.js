require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const dns = require('dns');
const userRoutes = require("./routes/userRoutes");
const ErrorHandler = require('./middleware/ErrorHandler');

dns.setServers(['8.8.8.8', '1.1.1.1']);
const app = express();


connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.get("/", (_req, res) => {
  res.json({ message: "GIU-Nexus API is running" });
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/users", userRoutes);

// Centralized error handling middleware (must be last)
app.use(ErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
