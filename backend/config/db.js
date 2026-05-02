const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  try {
    // Attempt to connect to MongoDB Atlas
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,  // Timeout for initial connection attempt
      socketTimeoutMS: 45000,          // Timeout for socket communication
    });

    console.log("MongoDB connected successfully.");
  } catch (err) {
    // If connection fails, print the error message and exit the process
    console.error("MongoDB connection failed:", err.message);
    
    // Exit the process with failure status if the connection is not established
    process.exit(1); // Optional: Remove this line if you prefer not to exit on failure
  }
};

module.exports = connectDB;
