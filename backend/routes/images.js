const express = require("express");
const router = express.Router();
const { uploadImage } = require("../utils/cloudinary");
const { userAuth } = require("../middleware/auth");

// ─────────────────────────────────────────
// POST /api/images/upload
// Upload ticket image to Cloudinary
// ─────────────────────────────────────────
router.post("/upload", userAuth, async (req, res) => {
  try {
    const { image, ticketId } = req.body;

    if (!image || !ticketId) {
      return res.status(400).json({ error: "Image and ticketId required" });
    }

    // Image should be base64 data URI
    if (!image.startsWith("data:image")) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    // Upload to Cloudinary
    const imageUrl = await uploadImage(image, ticketId);

    res.json({ url: imageUrl, ticketId });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

module.exports = router;
