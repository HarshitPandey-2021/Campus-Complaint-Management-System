const { Readable } = require("stream");
const { cloudinary } = require("../config/cloudinary");

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { ...options, use_filename: true, unique_filename: true },
      (error, result) => {
        if (error) {
          console.error("Upload error:", error.message);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });

module.exports = { uploadToCloudinary };
