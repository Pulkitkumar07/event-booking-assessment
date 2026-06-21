const {
  createOrganizerEvent,
  getEventAnalytics,
  listEventAttendees,
  listOrganizerEvents,
  updateOrganizerEvent
} = require("../services/organizer.service");

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EVENT_FIELDS = [
  "title",
  "description",
  "venue",
  "startsAt",
  "capacity",
  "price"
];

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function validateEventId(eventId) {
  if (!UUID_PATTERN.test(eventId)) {
    throw validationError("Event id must be a valid UUID");
  }
}

function validateText(value, fieldName, maximum, required) {
  if (value === undefined && !required) {
    return undefined;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    throw validationError(`${fieldName} is required`);
  }

  const text = value.trim();

  if (text.length > maximum) {
    throw validationError(`${fieldName} cannot exceed ${maximum} characters`);
  }

  return text;
}

function validateStartsAt(value, required) {
  if (value === undefined && !required) {
    return undefined;
  }

  const date = new Date(value);

  if (
    typeof value !== "string" ||
    Number.isNaN(date.getTime()) ||
    date <= new Date()
  ) {
    throw validationError("startsAt must be a valid future date and time");
  }

  return date;
}

function validateCapacity(value, required) {
  if (value === undefined && !required) {
    return undefined;
  }

  if (!Number.isInteger(value) || value < 1 || value > 1000000) {
    throw validationError("capacity must be an integer between 1 and 1000000");
  }

  return value;
}

function validatePrice(value, required) {
  if (value === undefined && !required) {
    return undefined;
  }

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 99999999.99
  ) {
    throw validationError("price must be between 0 and 99999999.99");
  }

  return value.toFixed(2);
}

function validateEventData(body = {}, partial = false) {
  const providedFields = EVENT_FIELDS.filter(
    (field) => body[field] !== undefined
  );

  if (partial && providedFields.length === 0) {
    throw validationError("At least one event field is required");
  }

  const eventData = {
    title: validateText(body.title, "title", 200, !partial),
    description: validateText(
      body.description,
      "description",
      5000,
      !partial
    ),
    venue: validateText(body.venue, "venue", 255, !partial),
    startsAt: validateStartsAt(body.startsAt, !partial),
    capacity: validateCapacity(body.capacity, !partial),
    price: validatePrice(body.price, !partial)
  };

  return Object.fromEntries(
    Object.entries(eventData).filter(([, value]) => value !== undefined)
  );
}

async function createEvent(request, response, next) {
  try {
    const eventData = validateEventData(request.body);
    const event = await createOrganizerEvent(request.user.id, eventData);

    return response.status(201).json({
      message: "Event created",
      event
    });
  } catch (error) {
    return next(error);
  }
}

async function updateEvent(request, response, next) {
  try {
    validateEventId(request.params.id);
    const eventData = validateEventData(request.body, true);
    const event = await updateOrganizerEvent(
      request.user.id,
      request.params.id,
      eventData
    );

    return response.status(200).json({
      message: "Event updated",
      event
    });
  } catch (error) {
    return next(error);
  }
}

async function getOrganizerEvents(request, response, next) {
  try {
    const events = await listOrganizerEvents(request.user.id);
    return response.status(200).json({ events });
  } catch (error) {
    return next(error);
  }
}

async function getAttendees(request, response, next) {
  try {
    validateEventId(request.params.id);
    const result = await listEventAttendees(
      request.user.id,
      request.params.id
    );

    return response.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getAnalytics(request, response, next) {
  try {
    validateEventId(request.params.id);
    const result = await getEventAnalytics(
      request.user.id,
      request.params.id
    );

    return response.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createEvent,
  getAnalytics,
  getAttendees,
  getOrganizerEvents,
  updateEvent
};
