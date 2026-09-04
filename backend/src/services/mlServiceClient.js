// backend/src/services/mlServiceClient.js
//
// Thin HTTP client to the Python ml-service. Every call is wrapped so a
// down/unreachable ml-service produces a clear, typed error instead of
// an uncaught exception - per master prompt section 41 (Fallback Modes):
// the app must never crash because one AI service is unavailable.

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";

class MlServiceUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = "MlServiceUnavailableError";
  }
}

async function getPricePrediction(features) {
  let response;
  try {
    response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    throw new MlServiceUnavailableError(
      `ML service is unreachable at ${ML_SERVICE_URL}. Is it running? (${err.message})`
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new MlServiceUnavailableError("ML service returned an unexpected response.");
  }

  if (!response.ok) {
    const err = new Error(data.message || "ML service returned an error.");
    err.status = response.status;
    err.mlServiceError = data;
    throw err;
  }

  return data;
}

module.exports = { getPricePrediction, MlServiceUnavailableError };
