const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getAdminStats,
  getAdminApplications,
} = require("../controllers/adminController");

router.get("/stats", protect, authorize("admin"), getAdminStats);
router.get("/applications", protect, authorize("admin"), getAdminApplications);

module.exports = router;