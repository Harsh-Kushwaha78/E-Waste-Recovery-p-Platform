// backend/src/app.js
//
// Builds and configures the Express app. Kept separate from server.js so
// tests can import the app without actually binding to a port.

const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const devicesRoutes = require("./routes/devices");
const componentsRoutes = require("./routes/components");
const pricesRoutes = require("./routes/prices");
const predictionsRoutes = require("./routes/predictions");
const cvRoutes = require("./routes/cv");
const marketRoutes = require("./routes/market");
const valuationRoutes = require("./routes/valuation");
const chatRoutes = require("./routes/chat");
const listingsRoutes = require("./routes/listings");
const recyclingRoutes = require("./routes/recycling");
const adminRoutes = require("./routes/admin");

function createApp() {
  const app = express();

  // --- Core middleware ---
  // CORS origin is configurable via CORS_ORIGIN (comma-separated list).
  // Defaults to permissive (*) only when unset, which is fine for local
  // dev but should always be set explicitly in production - see
  // docs/deployment.md.
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : "*";
  app.use(cors({ origin: corsOrigins }));

  app.use(express.json({ limit: "2mb" }));

  // Basic request logging - timestamp, method, path, status, duration.
  // Lightweight enough to leave on in production without a dependency.
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
    });
    next();
  });

  // --- Routes ---
  app.use("/api/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/devices", devicesRoutes);
  app.use("/api/components", componentsRoutes);
  app.use("/api/prices", pricesRoutes);
  app.use("/api/predictions", predictionsRoutes);
  app.use("/api/cv", cvRoutes);
  app.use("/api/market", marketRoutes);
  app.use("/api/valuation", valuationRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/listings", listingsRoutes);
  app.use("/api/recycling", recyclingRoutes);
  app.use("/api/admin", adminRoutes);

  // Future phases will mount more routers here, e.g.:
  // app.use("/api/models", require("./routes/models"));

  // --- 404 handler ---
  app.use((req, res) => {
    res.status(404).json({
      status: "error",
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // --- Centralized error handler ---
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error("[error]", err);
    res.status(err.status || 500).json({
      status: "error",
      message: err.message || "Internal server error",
    });
  });

  return app;
}

module.exports = { createApp };
