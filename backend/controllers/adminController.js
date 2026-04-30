const User = require('../models/User');
const JobPost = require('../models/JobPost');
const Application = require('../models/Application');

// GET /api/v1/admin/applications - Admin gets paginated applications with user/job details
exports.getAdminApplications = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Application.countDocuments();
    const applications = await Application.find()
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('job', 'title company');

    res.status(200).json({
      success: true,
      total,
      page,
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/admin/stats - Admin gets platform stats by role/status and top jobs by application count
exports.getAdminStats = async (req, res, next) => {
  try {
    const usersByRoleAgg = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const jobsByStatusAgg = await JobPost.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const applicationsByStatusAgg = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const topJobsByApplicationCountAgg = await Application.aggregate([
      { $group: { _id: '$job', applicationCount: { $sum: 1 } } },
      { $sort: { applicationCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: JobPost.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'job',
        },
      },
      { $unwind: { path: '$job', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          _id: 0,
          jobId: '$_id',
          title: '$job.title',
          company: '$job.company',
          applicationCount: 1,
        },
      },
    ]);

    const usersByRole = usersByRoleAgg.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const jobsByStatus = jobsByStatusAgg.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const applicationsByStatus = applicationsByStatusAgg.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      usersByRole,
      jobsByStatus,
      applicationsByStatus,
      topJobsByApplicationCount: topJobsByApplicationCountAgg,
    });
  } catch (err) {
    next(err);
  }
};
