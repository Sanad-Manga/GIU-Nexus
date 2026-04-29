const JobPost = require('../models/JobPost');

// ─── GET /api/v1/jobs ─────────────────────────────────────────────────────────
// Public. Returns paginated list of all jobs.
// Supports filters: keyword (searches title + description), location, type, status
const getJobs = async (req, res, next) => {
  try {
    const { keyword, location, type, status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (keyword) filter.$or = [
      { title:       { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
    ];
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (type)     filter.type     = type;
    if (status)   filter.status   = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await JobPost.countDocuments(filter);
    const jobs  = await JobPost.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });

    res.status(200).json({ success: true, total, page: Number(page), jobs });
  } catch (err) { next(err); }
};

// ─── GET /api/v1/jobs/my-jobs ─────────────────────────────────────────────────
// Private (recruiter only). Returns only jobs created by the logged-in recruiter.
// Filters by createdBy === req.user._id
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await JobPost.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, jobs });
  } catch (err) { next(err); }
};

// ─── GET /api/v1/jobs/:id ─────────────────────────────────────────────────────
// Public. Returns a single job by ID.
// Populates createdBy with recruiter name and email only (not full user object)
const getJobById = async (req, res, next) => {
  try {
    const job = await JobPost.findById(req.params.id).populate('createdBy', 'name email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, job });
  } catch (err) { next(err); }
};

// ─── POST /api/v1/jobs ────────────────────────────────────────────────────────
// Private (approved recruiter only).
// Business rule: recruiters with status "pending" are blocked with 403.
// category is hardcoded to "Other" for Sprint 1 — Baraa will provide the real
// AI classifier (GNX-21) in Sprint 2. Swap the stub at the TODO below.
const createJob = async (req, res, next) => {
  try {
    // Block pending recruiters from posting jobs
    if (req.user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Wait for admin approval before posting jobs.',
      });
    }

    // TODO Sprint 2: replace with Baraa's classifyJob(req.body.description)
    const category = 'Other';

    const job = await JobPost.create({ ...req.body, category, createdBy: req.user._id });
    res.status(201).json({ success: true, job });
  } catch (err) { next(err); }
};

// ─── PATCH /api/v1/jobs/:id ───────────────────────────────────────────────────
// Private (recruiter only). Updates a job post.
// Business rule: only the recruiter who created the job can edit it (403 otherwise).
// TODO Sprint 2: if description is updated, re-run AI classification to update category.
const updateJob = async (req, res, next) => {
  try {
    const job = await JobPost.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Ownership check — only the creator can edit
    if (job.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorised to edit this job' });

    // TODO Sprint 2: if (req.body.description) req.body.category = await classifyJob(req.body.description);

    const updated = await JobPost.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, job: updated });
  } catch (err) { next(err); }
};

// ─── DELETE /api/v1/jobs/:id ──────────────────────────────────────────────────
// Private. Recruiter can only delete their own jobs (403 otherwise).
// Admin can delete any job regardless of ownership.
const deleteJob = async (req, res, next) => {
  try {
    const job = await JobPost.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const isOwner = job.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Block if neither owner nor admin
    if (!isOwner && !isAdmin)
      return res.status(403).json({ success: false, message: 'Not authorised to delete this job' });

    await job.deleteOne();
    res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (err) { next(err); }
};

module.exports = { getJobs, getMyJobs, getJobById, createJob, updateJob, deleteJob };