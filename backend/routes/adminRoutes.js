const express = require("express");
const router = express.Router();

const { getAllApplications, getAdminStats, getAdminApplications } = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

// GET /admin/applications
router.get("/applications", protect, authorize("admin"), getAllApplications);

// GET /admin/stats
router.get("/stats", protect, authorize("admin"), getAdminStats);

// GET /api/v1/admin/applications
router.get("/api/v1/admin/applications", protect, authorize("admin"), getAdminApplications);

module.exports = router;