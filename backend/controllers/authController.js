const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { sendResetEmail, sendOtpEmail } = require('../services/emailService');
const { addToBlacklist } = require('../services/tokenBlacklist');

// generate token with a unique jti for blacklisting
const generateToken = (id) => {
  return jwt.sign({ id, jti: uuidv4() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// generate a 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
    }

    if (!['jobSeeker', 'recruiter'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either jobSeeker or recruiter',
      });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      status: role === 'recruiter' ? 'pending' : 'approved',
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

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
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
        profilePicture: user.profilePicture || '',
        skills: user.skills || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user — blacklists the token so it can't be reused
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    if (req.token && req.token.jti) {
      addToBlacklist(req.token.jti);
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password — sends OTP to email first
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

    // always return 200 to avoid email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a reset OTP has been sent.',
      });
    }

    // generate OTP, hash it, store with 10 min expiry
    const otp = generateOtp();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    user.otpCode = otpHash;
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.otpVerified = false;

    await user.save();

    try {
      await sendOtpEmail(user.email, otp);
    } catch (emailErr) {
      user.otpCode = undefined;
      user.otpExpire = undefined;
      await user.save();
      console.error('OTP email error:', emailErr);
    }

    res.status(200).json({
      success: true,
      message: 'If that email exists, a reset OTP has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP — issues reset link on success
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP',
      });
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      otpCode: otpHash,
      otpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'OTP is invalid or has expired',
      });
    }

    // clear OTP and issue a password reset token
    user.otpCode = undefined;
    user.otpExpire = undefined;
    user.otpVerified = true;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    try {
      await sendResetEmail(user.email, resetToken, resetLink);
    } catch (emailErr) {
      console.error('Reset email error:', emailErr);
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified. A password reset link has been sent to your email.',
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

    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

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

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.otpVerified = undefined;

    await user.save();

    const newToken = generateToken(user._id);

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