const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary and return URL
async function uploadImage(dataURI, ticketId) {
  try {
    const result = await cloudinary.uploader.upload(dataURI.trim(), {
      folder: "ict-support-desk/tickets",
      public_id: `ticket-${ticketId}-${Date.now()}`,
      resource_type: "auto",
      quality: "auto", // Auto-compress
      fetch_format: "auto", // Auto-format (WebP, etc.)
      flags: "progressive", // Progressive JPEG
      timeout: 120000,
      chunk_size: 6000000,
    });

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

module.exports = { uploadImage, cloudinary };
