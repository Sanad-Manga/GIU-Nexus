    const mongoose = require("mongoose");

// MongoDB connection string
const MONGO_URI = "mongodb://localhost:27017/giu-nexus";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });