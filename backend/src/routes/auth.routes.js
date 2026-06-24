const express = require("express");
const {
  getCurrentUser,
  login,
  logout,
  signup
} = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authRateLimiter } = require("../middleware/rate-limit.middleware");

const router = express.Router();

router.post("/signup", authRateLimiter, signup);
router.post("/login", authRateLimiter, login);
router.post("/logout", logout);
router.get("/me", authenticate, getCurrentUser);

module.exports = { authRouter: router };
