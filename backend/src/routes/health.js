// backend/src/routes/health.js
//
// GET /api/health
//
// Purpose: let the frontend (and you, while testing) know:
//   1. The backend process is up.
//   2. Whether MongoDB is currently connected.
//
// This route deliberately never throws. It always returns 200 with an
// honest status object, per the "no fake AI / no fake status" principle
// in the master prompt (section 6) applied here to infrastructure status.

const express = require("express");
const { getDbState } = require("../config/db");

const router = express.Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";
const CV_SERVICE_URL = process.env.CV_SERVICE_URL || "http://localhost:8002";

router.get("/", async (req, res) => {
  const db = getDbState();

  let mlService = { reachable: false, note: "Not checked yet." };
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    const data = await response.json();
    mlService = {
      reachable: response.ok,
      modelLoaded: data.modelLoaded,
      modelVersion: data.modelVersion,
      isDemoData: data.isDemoData,
    };
  } catch (err) {
    mlService = {
      reachable: false,
      note: `ML service unreachable at ${ML_SERVICE_URL}. Price predictions will return 503 until it's running.`,
    };
  }

  let cvService = { reachable: false, note: "Not checked yet." };
  try {
    const response = await fetch(`${CV_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    const data = await response.json();
    cvService = {
      reachable: response.ok,
      mode: data.mode,
    };
  } catch (err) {
    cvService = {
      reachable: false,
      note: `CV service unreachable at ${CV_SERVICE_URL}. Image analysis will return 503 until it's running - manual component entry still works.`,
    };
  }

  res.status(200).json({
    status: "ok",
    service: "ewaste-backend",
    timestamp: new Date().toISOString(),
    database: {
      connected: db.connected,
      note: db.connected
        ? "MongoDB is connected."
        : "MongoDB is NOT connected. API will still run, but any route needing the database will fail explicitly.",
      lastError: db.lastError,
    },
    mlService,
    cvService,
  });
});

module.exports = router;
