const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const validator = require("validator");
const xss = require("xss");
const { sendResetEmail } = require("../services/emailService");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Sanitize inputs
    const sanitizedEmail = xss(validator.normalizeEmail(email));
    const sanitizedName = xss(validator.escape(name));

    // Block script injection attempts in name field
    const xssPattern = /(<script|alert\s*\(|javascript:|on\w+=)/i;
    if (xssPattern.test(name)) {
      return res.status(400).json({
        success: false,
        message: "Invalid characters in name field",
      });
    }

    // Validate name length
    if (!validator.isLength(sanitizedName, { min: 2, max: 50 })) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 50 characters",
      });
    }

    // Validate name contains letters, spaces, hyphens and apostrophes only
    if (/[^a-zA-Z\s\-']/.test(sanitizedName)) {
      return res.status(400).json({
        success: false,
        message: "Name contains invalid characters",
      });
    }

    const allowedRoles = ["jobSeeker", "recruiter"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be 'jobSeeker' or 'recruiter'",
      });
    }

    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Pass plain password — pre-save hook handles hashing
    const user = new User({
      name: sanitizedName,
      email: sanitizedEmail,
      password: password,
      role,
      status: role === "recruiter" ? "pending" : "approved",
    });

    await user.save();

    const token = generateToken(user._id);

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

// POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profilePicture: user.profilePicture || "",
        skills: user.skills || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/logout
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email",
      });
    }

    const user = await User.findOne({ email });

    // Always return 200 to avoid email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "Password reset email sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendResetEmail(user.email, resetToken, resetLink);
    } catch (emailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      console.error("Email error:", emailErr);
    }

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please provide a new password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Explicitly select hidden fields needed for this query
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token is invalid or has expired",
      });
    }

    // Plain password — pre-save hook hashes it
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const newToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      token: newToken,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/v1/auth/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile (name, bio, profilePicture)
// @route   PATCH /api/v1/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, profilePicture } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PATCH /api/v1/auth/profile/change-password
// @access  Private
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
  } catch (err) {
    next(err);
  }
};