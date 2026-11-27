// Health check

const { cloudinary } = require("../config/cloudinary");
const { getEmailConfigStatus } = require("../utils/emailService");

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

// Email config check (no secrets exposed)
function emailHealth(req, res) {
  const status = getEmailConfigStatus();
  res.status(status.ready ? 200 : 503).json({
    ok: status.ready,
    providers: status.providers,
    mailFrom: status.mailFrom,
    hasBrevoApiKey: status.hasBrevoApiKey,
    hasSmtp: status.hasSmtp,
    issues: status.issues,
  });
}

module.exports = { health, testCloudinary, emailHealth };

