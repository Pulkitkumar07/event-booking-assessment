const {
  getEventDetails,
  listUpcomingEvents
} = require("../services/event.service");
const { bookEvent } = require("../services/booking.service");

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parsePositiveInteger(value, defaultValue, fieldName, maximum) {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throwValidationError(`${fieldName} must be a positive integer`);
  }

  const number = Number(value);

  if (number < 1 || number > maximum) {
    throwValidationError(`${fieldName} must be between 1 and ${maximum}`);
  }

  return number;
}

function parseSearch(value) {
  if (value === undefined || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throwValidationError("search must be a string");
  }

  const search = value.trim();

  if (search.length > 100) {
    throwValidationError("search cannot exceed 100 characters");
  }

  return search || undefined;
}

function parseDate(value) {
  if (value === undefined || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    throwValidationError("date must use YYYY-MM-DD format");
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throwValidationError("date must be a valid calendar date");
  }

  return value;
}

function throwValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
}

function validateEventId(eventId) {
  if (!UUID_PATTERN.test(eventId)) {
    throwValidationError("Event id must be a valid UUID");
  }
}

async function listEvents(request, response, next) {
  try {
    const filters = {
      search: parseSearch(request.query.search),
      date: parseDate(request.query.date),
      page: parsePositiveInteger(request.query.page, 1, "page", 10000),
      limit: parsePositiveInteger(request.query.limit, 20, "limit", 100)
    };
    const result = await listUpcomingEvents(filters);

    return response.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getEvent(request, response, next) {
  try {
    validateEventId(request.params.id);

    const event = await getEventDetails(
      request.params.id,
      request.user?.id ?? null
    );

    return response.status(200).json({ event });
  } catch (error) {
    return next(error);
  }
}

async function createBooking(request, response, next) {
  try {
    validateEventId(request.params.id);

    const result = await bookEvent(request.params.id, request.user.id);

    return response.status(201).json({
      message: "Booking confirmed",
      ...result
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createBooking,
  getEvent,
  listEvents
};
