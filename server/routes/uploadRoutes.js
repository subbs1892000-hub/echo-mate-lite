const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { uploadImage } = require("../controllers/uploadController");

const router = express.Router();

router.post("/image", protect, uploadImage);

module.exports = router;
