const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  // The student who is applying
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // The job being applied to
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobPost",
    required: true,
  },

  // Optional cover letter
  coverLetter: {
    type: String,
    trim: true,
    maxlength: 1000,
  },

  // Application status
  status: {
    type: String,
    enum: ["pending", "shortlisted", "rejected"],
    default: "pending",
  },

  // When application was submitted
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate applications
applicationSchema.index({ user: 1, job: 1 }, { unique: 1 });

module.exports = mongoose.model("Application", applicationSchema);