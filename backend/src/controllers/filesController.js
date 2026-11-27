// File routes

const { cloudinary } = require("../config/cloudinary");

// Proxy PDF file
async function proxyPdf(req, res) {
  try {
    const { publicId } = req.params;
    const pdfUrl = cloudinary.url(publicId, {
      resource_type: "raw",
      secure: true,
    });

    const response = await fetch(pdfUrl);
    if (!response.ok) {
      return res.status(404).json({ message: "PDF not found" });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("PDF proxy error:", error);
    res.status(500).json({ message: "Failed to fetch PDF" });
  }
}

module.exports = { proxyPdf };

