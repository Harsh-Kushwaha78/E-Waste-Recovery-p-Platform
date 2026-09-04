// backend/src/config/db.js
//
// This module owns the MongoDB connection.
//
// IMPORTANT DESIGN DECISION (see MASTER PROMPT section 41 - Fallback Modes):
// The rest of the API must keep working (health check, static routes) even
// if MongoDB is not reachable. We never want "no database" to crash the
// whole backend process. Instead we track connection state and let routes
// report it honestly.

const mongoose = require("mongoose");

// In-memory flag other modules can check without importing mongoose directly.
const state = {
  isConnected: false,
  lastError: null,
};

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    state.isConnected = false;
    state.lastError = "MONGODB_URI not set in environment";
    console.warn(
      "[db] MONGODB_URI is not set. Server will start WITHOUT a database connection."
    );
    return;
  }

  try {
    mongoose.set("strictQuery", true);

    // By default Mongoose queues ("buffers") queries until a connection
    // exists, which means a request would hang silently instead of
    // failing fast when the DB is down. We disable that so routes get an
    // immediate, explicit error - consistent with the project's rule that
    // the app must fail explicitly, never hang, when a service is down.
    mongoose.set("bufferCommands", false);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // fail fast instead of hanging
    });

    state.isConnected = true;
    state.lastError = null;
    console.log("[db] MongoDB connected successfully.");

    mongoose.connection.on("disconnected", () => {
      state.isConnected = false;
      console.warn("[db] MongoDB disconnected.");
    });
  } catch (err) {
    state.isConnected = false;
    state.lastError = err.message;
    console.error(
      "[db] Failed to connect to MongoDB. Server will continue running without a database.",
      err.message
    );
  }
}

function getDbState() {
  return {
    connected: state.isConnected,
    lastError: state.lastError,
  };
}

module.exports = { connectDB, getDbState };
