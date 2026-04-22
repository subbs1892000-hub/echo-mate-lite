const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markNotificationsRead,
  getUnreadSummary
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", protect, getNotifications);
router.get("/summary", protect, getUnreadSummary);
router.post("/read", protect, markNotificationsRead);

module.exports = router;
