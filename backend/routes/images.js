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

    const [, base64Payload] = image.split(",");
    const base64 = base64Payload || image;
    const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
    const imageSizeBytes = Math.ceil((base64.length * 3) / 4) - padding;

    if (imageSizeBytes > 1024 * 1024) {
      return res.status(413).json({ error: "Image must be 1 MB or smaller." });
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
