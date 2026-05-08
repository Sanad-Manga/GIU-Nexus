const JobPost = require('../models/JobPost');
const User = require('../models/User');
const { classifyJobCategory } = require('../services/classificationService');
const hf = require('../services/hfService');
// ─── GET /api/v1/jobs ─────────────────────────────────────────────────────────
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
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await JobPost.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, jobs });
  } catch (err) { next(err); }
};

// ─── GET /api/v1/jobs/:id ─────────────────────────────────────────────────────
const getJobById = async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const job = await JobPost.findById(req.params.id).populate('createdBy', 'name email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, job });
  } catch (err) { next(err); }
};

// ─── POST /api/v1/jobs ────────────────────────────────────────────────────────
const createJob = async (req, res, next) => {
  try {
    if (req.user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Wait for admin approval before posting jobs.',
      });
    }

    const { title, company, description, requirements, location, type } = req.body;
    if (!title || !company || !description || !requirements || !location || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, company, description, requirements, location, type',
      });
    }

    const category = await classifyJobCategory(description);

    const job = await JobPost.create({ ...req.body, category, createdBy: req.user._id });
    res.status(201).json({ success: true, job });
  } catch (err) { next(err); }
};

// ─── PATCH /api/v1/jobs/:id ───────────────────────────────────────────────────
const updateJob = async (req, res, next) => {
  try {
    if (req.user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Wait for admin approval before managing jobs.',
      });
    }

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const job = await JobPost.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorised to edit this job' });

    if (req.body.description) req.body.category = await classifyJobCategory(req.body.description);
    const updated = await JobPost.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, job: updated });
  } catch (err) { next(err); }
};

// ─── DELETE /api/v1/jobs/:id ──────────────────────────────────────────────────
const deleteJob = async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const job = await JobPost.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const isOwner = job.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin)
      return res.status(403).json({ success: false, message: 'Not authorised to delete this job' });

    await job.deleteOne();
    res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (err) { next(err); }
};

// ─── GET /api/v1/jobs/recommended ────────────────────────────────────────────
// Private (jobSeeker only). Returns open jobs ranked by cosine similarity.
const getRecommendedJobs = async (req, res, next) => {
  try {
    const user = req.user;
    const openJobs = await JobPost.find({ status: 'open' });

    if (!openJobs.length) return res.status(200).json({ success: true, jobs: [] });

    if (!user.skills.length) return res.status(200).json({ success: true, jobs: openJobs });

    const studentText = user.skills.join(', ');
    const jobTexts = openJobs.map(job => `${job.title} ${job.requirements.join(' ')}`);

    try {
      const embeddings = await hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: [studentText, ...jobTexts],
      });

      const cosineSimilarity = (a, b) => {
        const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dot / (magA * magB);
      };

      const studentVec = embeddings[0];
      const ranked = openJobs
        .map((job, i) => ({ ...job.toObject(), score: cosineSimilarity(studentVec, embeddings[i + 1]) }))
        .sort((a, b) => b.score - a.score);

      return res.status(200).json({ success: true, jobs: ranked });
    } catch (hfErr) {
      console.error('[getRecommendedJobs] HF call failed:', hfErr.message);
      return res.status(200).json({ success: true, jobs: openJobs });
    }
  } catch (err) { next(err); }
};

// ─── POST /api/v1/jobs/:id/save ───────────────────────────────────────────────
// SCRUM-37: job seeker toggles save/unsave a job
const saveJob = async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const job = await JobPost.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Cannot save a closed job' });
    }

    const user = await User.findById(req.user._id).select('+savedJobs');
    const alreadySaved = user.savedJobs.some(id => id.toString() === job._id.toString());

    if (alreadySaved) {
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== job._id.toString());
      await user.save();
      return res.status(200).json({ success: true, message: 'Job removed from saved', saved: false });
    } else {
      user.savedJobs.push(job._id);
      await user.save();
      return res.status(200).json({ success: true, message: 'Job saved', saved: true });
    }
  } catch (err) { next(err); }
};

// ─── GET /api/v1/jobs/saved ───────────────────────────────────────────────────
// SCRUM-50: returns all saved jobs for the logged-in job seeker
const getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+savedJobs');
    const jobs = await JobPost.find({ _id: { $in: user.savedJobs } });
    res.status(200).json({ success: true, jobs });
  } catch (err) { next(err); }
};

module.exports = {
  getJobs,
  getMyJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecommendedJobs,
  saveJob,
  getSavedJobs,
};
