const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dns = require("dns");
const dotenv = require("dotenv");

dotenv.config({ path: "../backend/.env" });

const User = require("../backend/models/User");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const adminData = {
  name: "Admin User",
  email: "admin@example.com",
  password: "adminpassword",
  role: "admin",
  status: "approved",
};

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
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
      // Hash password manually — bypass pre-save hook to avoid double-hashing
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);

      await User.create({
        ...adminData,
        password: hashedPassword,
      });
      console.log("Admin user created successfully.");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

createAdminUser();