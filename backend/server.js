
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dns = require('dns');

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const ErrorHandler = require('./middleware/ErrorHandler');

const errorHandler = require("./middleware/ErrorHandler");


const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");



// Set custom DNS servers
// Prefer reliable public DNS for SRV lookups (helps when local DNS/VPN blocks SRV)
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // needed so Swagger UI loads correctly
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "GIU Nexus API Docs",
  swaggerOptions: {
    persistAuthorization: true, // keeps your JWT token after page refresh
  },
}));


// Routes
app.get("/", (_req, res) => {
  res.json({ message: "GIU-Nexus API is running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/applications", applicationRoutes);
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
    console.log(` Swagger docs at http://localhost:${PORT}/api-docs`); 
  });
});

