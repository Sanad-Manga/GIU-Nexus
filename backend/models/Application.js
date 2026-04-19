const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  // The student who is applying
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // The job being applied to
 
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevents a student from applying to the same job twice
applicationSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
