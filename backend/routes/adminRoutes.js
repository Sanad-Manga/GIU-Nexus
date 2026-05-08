const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const { getAllApplications, getAdminStats } = require("../controllers/adminController");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only platform management endpoints
 */

/**
 * @swagger
 * /admin/applications:
 *   get:
 *     summary: Get all applications on the platform (Admin only, paginated)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: All applications with user and job details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 applications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       job:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           company:
 *                             type: string
 *                       status:
 *                         type: string
 *                       appliedAt:
 *                         type: string
 *                         format: date-time
 *       403:
 *         description: Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/applications", protect, authorize("admin"), getAllApplications);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get platform-wide statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     usersByRole:
 *                       type: object
 *                       properties:
 *                         jobSeeker:
 *                           type: integer
 *                           example: 120
 *                         recruiter:
 *                           type: integer
 *                           example: 34
 *                     jobsByStatus:
 *                       type: object
 *                       properties:
 *                         open:
 *                           type: integer
 *                           example: 58
 *                         closed:
 *                           type: integer
 *                           example: 21
 *                     appsByStatus:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: integer
 *                           example: 200
 *                         shortlisted:
 *                           type: integer
 *                           example: 45
 *                         rejected:
 *                           type: integer
 *                           example: 30
 *                     topJobs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           company:
 *                             type: string
 *                           applicationCount:
 *                             type: integer
 *       403:
 *         description: Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/stats", protect, authorize("admin"), getAdminStats);

module.exports = router;