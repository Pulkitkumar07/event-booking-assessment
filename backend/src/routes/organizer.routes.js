const express = require("express");
const { UserRole } = require("@prisma/client");
const {
  createEvent,
  getAnalytics,
  getAttendees,
  getOrganizerEvents,
  updateEvent
} = require("../controllers/organizer.controller");
const {
  authenticate,
  authorize
} = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate, authorize(UserRole.ORGANIZER));

router.get("/events", getOrganizerEvents);
router.post("/events", createEvent);
router.patch("/events/:id", updateEvent);
router.get("/events/:id/attendees", getAttendees);
router.get("/events/:id/analytics", getAnalytics);

module.exports = { organizerRouter: router };
