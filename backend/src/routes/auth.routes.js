const express = require("express");
const {
  getCurrentUser,
  login,
  logout,
  signup
} = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, getCurrentUser);

module.exports = { authRouter: router };
