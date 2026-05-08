const User = require("../models/User");
const hf = require("../services/hfService");
const { uploadProfilePicture } = require("../services/uploadService");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;

    if (req.file) {
      const result = await uploadProfilePicture(req.file.buffer, req.user._id);
      updates.profilePicture = result.secure_url;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(200).json({
        success: true,
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          bio: req.user.bio || '',
          skills: req.user.skills || [],
          profilePicture: req.user.profilePicture || '',
          role: req.user.role,
          status: req.user.status,
        },
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio || '',
        skills: updatedUser.skills || [],
        profilePicture: updatedUser.profilePicture || '',
        role: updatedUser.role,
        status: updatedUser.status,
      },
    });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6 || newPassword.length > 30) {
      return res.status(400).json({ success: false, message: 'Password must be between 6 and 30 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password cannot be the same as current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
};

exports.extractSkills = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.bio || user.bio.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Bio is empty. Update your profile first.",
      });
    }

    try {
      const result = await hf.tokenClassification({
        model: "dslim/bert-base-NER",
        inputs: user.bio,
      });

      const filtered = result.filter((entity) => {
        const tag = entity.entity_group || entity.entity || "";
        return ["B-MISC", "I-MISC", "B-ORG", "MISC", "ORG"].includes(tag);
      });

      const skills = [...new Set(filtered.map((e) => e.word))];

      user.skills = skills;
      await user.save();

      return res.status(200).json({ success: true, skills });
    } catch (hfError) {
      console.error("HuggingFace NER error:", hfError);
      return res.status(200).json({ success: true, skills: user.skills });
    }
  } catch (err) {
    next(err);
  }
};
