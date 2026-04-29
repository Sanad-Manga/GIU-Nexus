const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    select: false, // Don't return password by default in queries
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
  savedJobs: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "JobPost",
    default: [],
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);