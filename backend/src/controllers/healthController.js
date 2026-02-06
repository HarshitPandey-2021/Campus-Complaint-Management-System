// Health check

const { cloudinary } = require("../config/cloudinary");

// Health info
function health(req, res) {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

// Cloudinary test
async function testCloudinary(req, res) {
  try {
    const ping = await cloudinary.api.ping();
    res.json({
      status: "connected",
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      ping,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  }
}

module.exports = { health, testCloudinary };

