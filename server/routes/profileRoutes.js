const express = require("express");
const {
  getProfile,
  updateProfile,
  getPublicProfile,
  searchUsers,
  toggleFollowUser
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.get("/search", protect, searchUsers);
router.get("/:username", protect, getPublicProfile);
router.post("/:username/follow", protect, toggleFollowUser);

module.exports = router;
