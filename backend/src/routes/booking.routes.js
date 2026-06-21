const express = require("express");
const {
  cancelMyBooking,
  getMyBookings
} = require("../controllers/booking.controller");
const { authenticate } = require("../middleware/auth.middleware");

const bookingRouter = express.Router();
const meRouter = express.Router();

meRouter.get("/bookings", authenticate, getMyBookings);
bookingRouter.delete("/:id", authenticate, cancelMyBooking);

module.exports = {
  bookingRouter,
  meRouter
};
