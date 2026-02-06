const app = require("./src/app");
const { initializeDb } = require("./src/config/db");
const { cloudinary } = require("./src/config/cloudinary");

require("dotenv").config();

const PORT = process.env.PORT || 4000;

// Connect DB and start server
async function start() {
  const { db, collections } = await initializeDb();
  app.locals.db = db;
  app.locals.collections = collections;

  try {
    await cloudinary.api.ping();
    console.log("? Cloudinary connected");
  } catch (err) {
    console.error("? Cloudinary FAILED:", err.message);
  }

  // Start HTTP server
  app.listen(PORT, () => {
    console.log(`?? Server: http://localhost:${PORT}`);

    if (process.env.NODE_ENV === "production") {
      const keepAlive = () => {
        setInterval(() => {
          const url = process.env.RENDER_EXTERNAL_URL;
          if (url) {
            fetch(`${url}/health`)
              .then(() => console.log("? Keep-alive ping"))
              .catch((err) => console.log("? Ping failed:", err.message));
          }
        }, 14 * 60 * 1000);
      };

      setTimeout(() => {
        keepAlive();
        console.log("?? Keep-alive started");
      }, 60 * 1000);
    }
  });
}

start().catch((e) => {
  console.error("Failed to start:", e);
  process.exit(1);
});
