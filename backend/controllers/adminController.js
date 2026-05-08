const Application = require("../models/Application");
const User = require("../models/User");
const JobPost = require("../models/JobPost");

const getAllApplications = async (req, res, next) => {
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

    return res.status(200).json({ success: true, total, page, applications });
  } catch (err) {
    next(err);
  }
};

const getAdminStats = async (req, res, next) => {
  try {
    const [usersByRoleAgg, jobsByStatusAgg, appsByStatusAgg, topJobs] = await Promise.all([
      User.aggregate([
        { $match: { role: { $in: ["jobSeeker", "recruiter"] } } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      JobPost.aggregate([
        { $match: { status: { $in: ["open", "closed"] } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Application.aggregate([
        { $match: { status: { $in: ["pending", "shortlisted", "rejected"] } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Application.aggregate([
        { $group: { _id: "$job", applicationCount: { $sum: 1 } } },
        { $sort: { applicationCount: -1, _id: 1 } },
        { $limit: 5 },
        { $lookup: { from: "jobposts", localField: "_id", foreignField: "_id", as: "job" } },
        { $unwind: "$job" },
        { $project: { _id: 0, jobId: "$job._id", title: "$job.title", company: "$job.company", applicationCount: 1 } },
      ]),
    ]);

    const usersByRole = { jobSeeker: 0, recruiter: 0 };
    for (const item of usersByRoleAgg) usersByRole[item._id] = item.count;

    const jobsByStatus = { open: 0, closed: 0 };
    for (const item of jobsByStatusAgg) jobsByStatus[item._id] = item.count;

    const appsByStatus = { pending: 0, shortlisted: 0, rejected: 0 };
    for (const item of appsByStatusAgg) appsByStatus[item._id] = item.count;

    return res.status(200).json({
      success: true,
      stats: { usersByRole, jobsByStatus, appsByStatus, topJobs },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllApplications, getAdminStats };
