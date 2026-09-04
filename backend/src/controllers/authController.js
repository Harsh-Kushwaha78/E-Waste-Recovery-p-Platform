// backend/src/controllers/authController.js
//
// Route handler logic for /api/auth/*. Kept separate from the router file
// so routes.js stays a clean map of "URL -> handler" and this file holds
// the actual business logic.

const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "name, email, and password are all required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 8 characters.",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        status: "error",
        message: "An account with this email already exists.",
      });
    }

    // Bootstrap: the very first account on a fresh install becomes an
    // admin automatically, since there's no other way to create one yet
    // (no seed script, no separate admin invite flow - keeping this
    // simple for the MVP per master prompt section 47). Every account
    // after that is a normal user by default.
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "user";

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id);

    res.status(201).json({
      status: "ok",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "email and password are required.",
      });
    }

    // .select("+password") because the schema hides password by default
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    // Deliberately vague error - do not reveal whether it was the email
    // or the password that was wrong (standard security practice).
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: "ok",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
//
// JWTs are stateless - the server doesn't hold a session to destroy.
// "Logout" here just confirms to the frontend that it should discard its
// stored token. (A token blocklist could be added later for immediate
// server-side revocation, but that's unnecessary complexity for an MVP.)
function logout(req, res) {
  res.status(200).json({
    status: "ok",
    message: "Logged out. Discard the token on the client.",
  });
}

module.exports = { register, login, logout };
