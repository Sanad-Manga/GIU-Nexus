const hf = require("../services/hfService");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
// POST /api/v1/profile/extract-skills
// Job Seeker only

// GET /api/v1/profile
// Private (any authenticated user)
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

// PATCH /api/v1/profile
// Private (any authenticated user)
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, profilePicture } = req.body;
    const updates = {};
    if (name)           updates.name           = name;
    if (bio)            updates.bio            = bio;
    if (profilePicture) updates.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

// PATCH /api/v1/profile/change-password
// Private (any authenticated user)
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide current and new password" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) { next(err); }
};


exports.extractSkills = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Return 400 if bio is empty
    if (!user.bio || user.bio.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Bio is empty. Update your profile first.",
      });
    }

    try {
      // Call HuggingFace NER model
      const result = await hf.tokenClassification({
        model: "dslim/bert-base-NER",
        inputs: user.bio,
      });

      // Filter for relevant entity groups only
      // HF API returns "ORG"/"MISC" (aggregated) or "B-ORG"/"B-MISC" (non-aggregated)
      const filtered = result.filter((entity) => {
        const tag = entity.entity_group || entity.entity || "";
        return ["B-MISC", "I-MISC", "B-ORG", "MISC", "ORG"].includes(tag);
      });

      // Map to words and deduplicate
      const cleaned = [...new Set(filtered.map((e) => e.word))];

      // Save to user profile
      user.skills = cleaned;
      await user.save();

      return res.status(200).json({
        success: true,
        skills: cleaned,
        extracted: cleaned,
      });

    } catch (hfError) {
      // Graceful fallback — return existing skills unchanged
      console.error("HuggingFace NER error:", hfError);
      return res.status(200).json({
        success: true,
        skills: user.skills,
        extracted: user.skills,
      });
    }

  } catch (err) {
    next(err);
  }
};