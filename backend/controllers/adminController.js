const User = require("../models/User");
const JobPost = require("../models/JobPost");
const Application = require("../models/Application");

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

// GET /api/v1/admin/stats
exports.getAdminStats = async (req, res, next) => {
  try {
    const usersByRoleRaw = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const usersByRole = usersByRoleRaw.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    const jobsByStatusRaw = await JobPost.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const jobsByStatus = jobsByStatusRaw.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    const appsByStatusRaw = await Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const appsByStatus = appsByStatusRaw.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    const topJobs = await Application.aggregate([
      { $group: { _id: "$job", applicationCount: { $sum: 1 } } },
      { $sort: { applicationCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "jobposts",
          localField: "_id",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      { $unwind: "$jobDetails" },
      {
        $project: {
          _id: "$jobDetails._id",
          title: "$jobDetails.title",
          company: "$jobDetails.company",
          applicationCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        usersByRole,
        jobsByStatus,
        appsByStatus,
        topJobs,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/admin/applications
exports.getAdminApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const total = await Application.countDocuments();
    const applications = await Application.find()
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("user", "name email")
      .populate("job", "title company")
      .lean();

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      applications,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllApplications, getAdminStats, getAdminApplications };
