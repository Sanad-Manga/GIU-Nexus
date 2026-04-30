const express = require("express");
const router = express.Router();

const { getAllApplications } = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

// GET /admin/applications
router.get("/applications", protect, authorize("admin"), getAllApplications);

module.exports = router;