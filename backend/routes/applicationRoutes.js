const express = require("express");
const router = express.Router();

const {
  getMyApplications,
  applyToJob,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const { getJobApplicants } = require("../controllers/jobApplicantsController");
const { protect, authorize } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Application management endpoints
 */

/**
 * @swagger
 * /applications/my:
 *   get:
 *     summary: Get all applications submitted by the logged-in job seeker
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Job seeker's applications with job details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 applications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, shortlisted, rejected]
 *                       appliedAt:
 *                         type: string
 *                         format: date-time
 *                       job:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           company:
 *                             type: string
 *                           type:
 *                             type: string
 *                           status:
 *                             type: string
 *       403:
 *         description: Job seekers only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/my", protect, authorize("jobSeeker"), getMyApplications);

/**
 * @swagger
 * /applications/{jobId}/apply:
 *   post:
 *     summary: Apply to a job (Job Seeker only — no duplicate applications)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter:
 *                 type: string
 *                 example: I am excited to apply for this position...
 *     responses:
 *       201:
 *         description: Application submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 application:
 *                   $ref: '#/components/schemas/Application'
 *       400:
 *         description: You have already applied to this job
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:jobId/apply", protect, authorize("jobSeeker"), applyToJob);

/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     summary: Update an application's status (Recruiter — must own the job)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, shortlisted, rejected]
 *                 example: shortlisted
 *     responses:
 *       200:
 *         description: Application status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 application:
 *                   $ref: '#/components/schemas/Application'
 *       403:
 *         description: Not authorised to update this application
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/:id/status", protect, authorize("recruiter"), updateApplicationStatus);

module.exports = router;