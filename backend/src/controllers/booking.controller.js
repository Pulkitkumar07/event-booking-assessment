const {
  cancelBooking,
  listUserBookings
} = require("../services/booking.service");

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateBookingId(bookingId) {
  if (!UUID_PATTERN.test(bookingId)) {
    const error = new Error("Booking id must be a valid UUID");
    error.statusCode = 400;
    throw error;
  }
}

async function getMyBookings(request, response, next) {
  try {
    const bookings = await listUserBookings(request.user.id);

    return response.status(200).json({ bookings });
  } catch (error) {
    return next(error);
  }
}

async function cancelMyBooking(request, response, next) {
  try {
    validateBookingId(request.params.id);

    const result = await cancelBooking(request.params.id, request.user.id);

    return response.status(200).json({
      message: "Booking cancelled",
      ...result
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  cancelMyBooking,
  getMyBookings
};
