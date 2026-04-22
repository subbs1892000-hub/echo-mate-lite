const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getStories, createStory, viewStory, deleteStory } = require("../controllers/storyController");

const router = express.Router();

router.get("/", protect, getStories);
router.post("/", protect, createStory);
router.post("/:id/view", protect, viewStory);
router.delete("/:id", protect, deleteStory);

module.exports = router;
