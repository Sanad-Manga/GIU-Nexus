const Application = require("../models/Application");
const User = require("../models/User");

// GET /admin/applications — returns all applications on the platform (admin only)
// supports ?page and ?limit query params for pagination
// populates user (name, email) and job (title, company)
const getAllApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Application.countDocuments();

    const applications = await Application.find()
      .populate("user", "name email")
      .populate("job", "title company")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      page,
      applications,
    });
  } catch (err) {
    console.error("getAllApplications error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /admin/stats — returns platform-wide summary statistics (admin only)
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalApplications = await Application.countDocuments();
    const pendingRecruiters = await User.countDocuments({ role: "recruiter", status: "pending" });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalApplications,
        pendingRecruiters,
      },
    });
  } catch (err) {
    console.error("getAdminStats error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getAllApplications, getAdminStats };