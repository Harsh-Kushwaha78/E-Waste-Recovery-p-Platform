// backend/src/routes/users.js
const express = require("express");
const { protect } = require("../middleware/protect");
const { requireDb } = require("../middleware/requireDb");

const router = express.Router();

// GET /api/users/me
// Protected route - proves the JWT middleware works end to end.
router.get("/me", requireDb, protect, (req, res) => {
  res.status(200).json({
    status: "ok",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
});

module.exports = router;
