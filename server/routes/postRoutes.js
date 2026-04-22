const express = require("express");
const {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  toggleSavePost,
  addComment,
  deleteComment
} = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getPosts);
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, toggleLikePost);
router.post("/:id/save", protect, toggleSavePost);
router.post("/:id/comments", protect, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

module.exports = router;
