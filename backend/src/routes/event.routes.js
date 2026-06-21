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

const router = express.Router();

router.get("/", listEvents);
router.post("/:id/book", authenticate, createBooking);
router.get("/:id", optionalAuthenticate, getEvent);

module.exports = { eventRouter: router };
