const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('C:/proj/GIU-Nexus/backend/models/User');  // Full absolute path

dotenv.config();  // Load environment variables from .env

// Admin user data
const adminData = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'adminpassword',  // Password will be hashed
  role: 'admin',
};

const createAdminUser = async () => {
  try {
    // Connect to the MongoDB database using MONGO_URI from .env
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if an admin already exists
    let admin = await User.findOne({ role: 'admin' });

    if (admin) {
      console.log('Admin user already exists');
      return;  // Exit if admin user already exists
    }

    // Hash the admin password before saving
    const salt = await bcrypt.genSalt(10);  // Generate salt
    const hashedPassword = await bcrypt.hash(adminData.password, salt);  // Hash the password

    // Create a new admin user with the hashed password
    admin = new User({
      ...adminData,  // Spread the admin data
      password: hashedPassword,  // Store the hashed password
    });

    // Save the new admin user to the database
    await admin.save();
    console.log('Admin user created successfully');

    // Close the MongoDB connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin user:', error);  // Log any errors
    mongoose.connection.close();  // Ensure the connection is closed on error
  }
};

// Execute the script to create the admin user
createAdminUser();