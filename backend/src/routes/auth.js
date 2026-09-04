// backend/src/routes/auth.js
const express = require("express");
const { register, login, logout } = require("../controllers/authController");
const { requireDb } = require("../middleware/requireDb");

const router = express.Router();

// register/login need the database; logout does not (stateless JWT).
router.post("/register", requireDb, register);
router.post("/login", requireDb, login);
router.post("/logout", logout);

module.exports = router;
