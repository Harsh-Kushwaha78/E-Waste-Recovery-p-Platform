// backend/src/middleware/requireDb.js
//
// Some routes cannot function without MongoDB (anything that reads/writes
// data). Rather than letting those routes fail with a raw, confusing
// driver error when the DB is down, this middleware checks connection
// state up front and returns a clear, honest message - per the project
// rule: "Database unavailable." instead of "Something went wrong."

const { getDbState } = require("../config/db");

function requireDb(req, res, next) {
  const db = getDbState();

  if (!db.connected) {
    return res.status(503).json({
      status: "error",
      message:
        "Database unavailable. This action requires MongoDB, which is not currently connected.",
    });
  }

  next();
}

module.exports = { requireDb };
