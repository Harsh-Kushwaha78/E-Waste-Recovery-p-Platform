// backend/src/server.js
//
// Process entrypoint. Loads env vars, connects to Mongo (non-blocking on
// failure, see config/db.js), then starts listening.

require("dotenv").config();

const { createApp } = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB(); // does not throw; server starts either way

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`[server] E-Waste backend listening on http://localhost:${PORT}`);
    console.log(`[server] Health check: http://localhost:${PORT}/api/health`);
  });
}

start();
