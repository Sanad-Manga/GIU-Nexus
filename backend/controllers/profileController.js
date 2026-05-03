const User = require('../models/User');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user: {
        _id: user._id, name: user.name, email: user.email,
        bio: user.bio || '', skills: user.skills || [],
        profilePicture: user.profilePicture || '',
        role: user.role, status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (req.file) {
      updates.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    }
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    res.status(200).json({
      success: true,
      user: {
        _id: user._id, name: user.name, email: user.email,
        bio: user.bio || '', skills: user.skills || [],
        profilePicture: user.profilePicture || '',
        role: user.role, status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide currentPassword and newPassword' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.extractSkills = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.bio || user.bio.trim() === '') {
      return res.status(400).json({ success: false, message: 'Bio is empty. Update your profile first.' });
    }
    try {
      const hf = require('../services/hfService');
      const result = await hf.tokenClassification({
        model: 'dslim/bert-base-NER',
        inputs: user.bio,
      });
      const skills = [...new Set(
        result
          .filter((e) => ['B-MISC', 'I-MISC', 'B-ORG'].includes(e.entity_group || e.entity))
          .map((e) => e.word.replace(/^##/, ''))
          .filter((w) => w.length > 1)
      )];
      user.skills = skills;
      await user.save();
      return res.status(200).json({ success: true, skills, extracted: skills });
    } catch (hfErr) {
      console.error('HuggingFace NER error:', hfErr.message);
      return res.status(200).json({ success: true, skills: user.skills, extracted: user.skills });
    }
  } catch (err) {
    next(err);
  }
};