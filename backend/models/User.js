const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    // Store only hashed password (bcrypt in Task 2)
  },
    profilePicture: {
    type: String, // URL string
    // optional — no required: true
  },
  bio: {
    type: String,
    // optional text field
  },
  skills: {
    type: [String], // array of strings, filled by AI in Task 2
    default: [],
  },
  role: {
    type: String,
    enum: ['jobSeeker', 'recruiter', 'admin'],
    default: 'jobSeeker',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    // only meaningful when role === 'recruiter'
    default: 'pending',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);