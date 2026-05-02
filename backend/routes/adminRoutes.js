const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const { getAllApplications, getAdminStats, getAdminApplications } = require("../controllers/adminController");

// GET /admin/applications
router.get("/applications", protect, authorize("admin"), getAllApplications);

// GET /admin/stats
router.get("/stats", protect, authorize("admin"), getAdminStats);

module.exports = router;