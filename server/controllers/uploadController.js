const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");
const { isValidUrl } = require("../utils/validators");

const uploadImage = async (req, res) => {
  try {
    const { imageData, folder = "echomatelite" } = req.body;

    if (!imageData) {
      return res.status(400).json({ message: "Image data is required" });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        message: "Cloud image storage is not configured. Add Cloudinary credentials first."
      });
    }

    if (!imageData.startsWith("data:image/") && !isValidUrl(imageData)) {
      return res.status(400).json({ message: "Please provide a valid image payload" });
    }

    const result = await cloudinary.uploader.upload(imageData, {
      folder
    });

    return res.status(201).json({
      message: "Image uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to upload image" });
  }
};

module.exports = { uploadImage };
