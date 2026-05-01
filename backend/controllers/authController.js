const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendResetEmail } = require('../services/emailService');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
    }

    // Validate role
    if (!['jobSeeker', 'recruiter'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either jobSeeker or recruiter',
      });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role,
      status: role === 'recruiter' ? 'pending' : 'approved',
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profilePicture: user.profilePicture || '',
        skills: user.skills || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user (stateless)
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email',
      });
    }

    const user = await User.findOne({ email });

    // Always return 200 to avoid email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token and expiry to user
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Build reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendResetEmail(user.email, resetToken, resetLink);
    } catch (emailErr) {
      // If email fails, clear the reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      console.error('Email error:', emailErr);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PATCH /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Hash the token to match stored one
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by reset token and check expiry
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token is invalid or has expired',
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Generate new token
    const newToken = generateToken(user);

    res.status(200).json({
      success: true,
      token: newToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current authenticated user's profile
// @route   GET /api/v1/auth/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    // req.user is attached by protect middleware
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        skills: user.skills || [],
        profilePicture: user.profilePicture || '',
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update current authenticated user's profile
// @route   PATCH /api/v1/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, profilePicture } = req.body;

    // 1. Sanitize input to prevent NoSQL injection (remove Mongo operators)
    const sanitizeValue = (val) => {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        // Reject any object that looks like a MongoDB operator (starts with $)
        if (Object.keys(val).some(k => k.startsWith('$'))) {
          return null;
        }
      }
      return val;
    };

    const updates = {};

    // 2. Validate and sanitize name
    if (typeof name !== 'undefined') {
      const cleanName = sanitizeValue(name);
      if (cleanName === null || (typeof cleanName !== 'string' && typeof cleanName !== 'number')) {
        return res.status(400).json({ success: false, message: 'Name must be a string or number' });
      }
      const nameStr = String(cleanName).trim();
      if (nameStr.length === 0) {
        return res.status(400).json({ success: false, message: 'Name cannot be empty' });
      }
      if (nameStr.length > 100) {
        return res.status(400).json({ success: false, message: 'Name cannot exceed 100 characters' });
      }
      // Optional: strip HTML tags against XSS
      updates.name = nameStr.replace(/<[^>]*>?/gm, '');
    }

    // 3. Validate bio
    if (typeof bio !== 'undefined') {
      const cleanBio = sanitizeValue(bio);
      if (cleanBio !== null && typeof cleanBio !== 'string') {
        return res.status(400).json({ success: false, message: 'Bio must be a string' });
      }
      const bioStr = cleanBio ? cleanBio.toString() : '';
      if (bioStr.length > 1000) {
        return res.status(400).json({ success: false, message: 'Bio cannot exceed 1000 characters' });
      }
      updates.bio = bioStr.replace(/<[^>]*>?/gm, '');
    }

    // 4. Validate profilePicture (basic URL check)
    if (typeof profilePicture !== 'undefined') {
      const cleanUrl = sanitizeValue(profilePicture);
      if (cleanUrl === null || typeof cleanUrl !== 'string') {
        return res.status(400).json({ success: false, message: 'Profile picture must be a string URL' });
      }
      const urlStr = cleanUrl.trim();
      // Simple URL validation (optional, but recommended)
      const urlPattern = /^(https?:\/\/)[^\s]+$/i;
      if (urlStr && !urlPattern.test(urlStr)) {
        return res.status(400).json({ success: false, message: 'Profile picture must be a valid URL (http:// or https://)' });
      }
      if (urlStr.length > 500) {
        return res.status(400).json({ success: false, message: 'Profile picture URL too long' });
      }
      updates.profilePicture = urlStr;
    }

    // If no fields after validation, return current user
    if (Object.keys(updates).length === 0) {
      const user = await req.user.populate();
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
  } catch (err) {
    next(err);
  }
};

// @desc    Change current authenticated user's password
// @route   PATCH /api/v1/auth/profile/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide currentPassword and newPassword',
      });
    }

    if (newPassword.length < 6 || newPassword.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'newPassword must be between 6 and 30 characters',
      });
    }

    const user = await User.findById(req.user._id).select('+password +passwordHistory');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
      return res.status(400).json({ success: false, message: 'New password must be different from current password' });
    }

    // Check password history (assuming passwordHistory is an array of old hashes)
    for (const oldHash of user.passwordHistory) {
      const reused = await bcrypt.compare(newPassword, oldHash);
      if (reused) {
        return res.status(400).json({ success: false, message: 'You have used this password before' });
      }
    }

    // Store current password hash into history
    user.passwordHistory.push(user.password);
    if (user.passwordHistory.length > 5) user.passwordHistory.shift();

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};