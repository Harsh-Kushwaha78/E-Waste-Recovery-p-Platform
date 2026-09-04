// backend/src/utils/generateToken.js
//
// Small helper so token creation logic lives in one place. Token contains
// only the user's id - never the password hash or anything sensitive.

const jwt = require("jsonwebtoken");

function generateToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not set in the environment. Add it to backend/.env"
    );
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

module.exports = { generateToken };
