const express = require("express");
const {
  createBooking,
  getEvent,
  listEvents
} = require("../controllers/event.controller");
const {
  authenticate,
  optionalAuthenticate
} = require("../middleware/auth.middleware");
const { bookingRateLimiter } = require("../middleware/rate-limit.middleware");

const router = express.Router();

router.get("/", listEvents);
router.post("/:id/book", authenticate, bookingRateLimiter, createBooking);
router.get("/:id", optionalAuthenticate, getEvent);

module.exports = { eventRouter: router };
