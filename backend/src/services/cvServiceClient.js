// backend/src/services/cvServiceClient.js
//
// Thin HTTP client to the Python cv-service, mirroring the pattern used
// for ml-service: any unreachable-service failure is wrapped into a
// typed error so routes can return a clean 503 instead of crashing
// (master prompt section 41).

const CV_SERVICE_URL = process.env.CV_SERVICE_URL || "http://localhost:8002";

class CvServiceUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = "CvServiceUnavailableError";
  }
}

async function detectComponents(imageBuffer, filename, mimetype) {
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: mimetype });
  formData.append("image", blob, filename);

  let response;
  try {
    response = await fetch(`${CV_SERVICE_URL}/detect`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    throw new CvServiceUnavailableError(
      `CV service is unreachable at ${CV_SERVICE_URL}. Is it running? (${err.message})`
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new CvServiceUnavailableError("CV service returned an unexpected response.");
  }

  if (!response.ok) {
    const err = new Error(data.message || "CV service returned an error.");
    err.status = response.status;
    err.cvServiceError = data;
    throw err;
  }

  return data;
}

module.exports = { detectComponents, CvServiceUnavailableError };
