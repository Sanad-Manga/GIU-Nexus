const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetEmail = async (email, resetToken, resetLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password (valid for 10 minutes):</p>
        <a href="${resetLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetLink}</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reset email sent to ${email}`);
  } catch (err) {
    console.error(`Error sending email: ${err.message}`);
    throw err;
  }
};

const sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Password Reset OTP',
      html: `
        <p>You requested a password reset.</p>
        <p>Your one-time code is:</p>
        <h2 style="letter-spacing: 8px; font-size: 32px;">${otp}</h2>
        <p>This code is valid for <strong>1 minute</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (err) {
    console.error(`Error sending OTP email: ${err.message}`);
    throw err;
  }
};

module.exports = {
  sendResetEmail,
  sendOtpEmail,
};
