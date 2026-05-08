const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dns = require("dns");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });


const User = require("../backend/models/User");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const adminData = {
  name: "Admin User",
  email: "admin@giu.edu",
  password: "adminpass123",
  role: "admin",
  status: "approved",
};

const createAdminUser = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected.");

    const existing = await User.findOne({ email: adminData.email });

    if (existing) {
      // Reset password to known default without double-hashing
      const salt = await bcrypt.genSalt(10);
      existing.password = await bcrypt.hash(adminData.password, salt);
      existing.name = adminData.name;
      existing.role = adminData.role;
      existing.status = "approved";
      // Use updateOne to bypass pre-save hook since we already hashed
      await User.updateOne(
        { email: adminData.email },
        {
          name: existing.name,
          role: existing.role,
          status: existing.status,
          password: existing.password,
        }
      );
      console.log("Admin already exists. Password reset to default.");
    } else {
      // Create new admin user
      await User.create({
        ...adminData,
      });
      console.log("Admin user created successfully.");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
    }
  }
};

createAdminUser();
