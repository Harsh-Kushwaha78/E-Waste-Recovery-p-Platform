// backend/src/middleware/adminOnly.js
//
// Must run after `protect` (needs req.user to already be set).
// Guards admin-only endpoints like price-record management.

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "Admin access required.",
    });
  }
  next();
}

module.exports = { adminOnly };
