const { BookingStatus } = require("@prisma/client");
const { prisma } = require("../config/database");

function notFoundError() {
  const error = new Error("Event not found");
  error.statusCode = 404;
  return error;
}

function formatOrganizerEvent(event) {
  const confirmedBookings = event._count.bookings;

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    venue: event.venue,
    startsAt: event.startsAt,
    capacity: event.capacity,
    price: event.price.toString(),
    confirmedBookings,
    seatsRemaining: Math.max(event.capacity - confirmedBookings, 0),
    createdAt: event.createdAt,
    updatedAt: event.updatedAt
  };
}

const organizerEventFields = {
  id: true,
  title: true,
  description: true,
  venue: true,
  startsAt: true,
  capacity: true,
  price: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      bookings: {
        where: {
          status: BookingStatus.CONFIRMED
        }
      }
    }
  }
};

async function createOrganizerEvent(organizerId, eventData) {
  const event = await prisma.event.create({
    data: {
      organizerId,
      ...eventData
    },
    select: organizerEventFields
  });

  return formatOrganizerEvent(event);
}

async function listOrganizerEvents(organizerId) {
  const events = await prisma.event.findMany({
    where: {
      organizerId
    },
    select: organizerEventFields,
    orderBy: [{ startsAt: "asc" }, { id: "asc" }]
  });

  return events.map(formatOrganizerEvent);
}

async function updateOrganizerEvent(organizerId, eventId, eventData) {
  return prisma.$transaction(async (transaction) => {
    const lockedEvents = await transaction.$queryRaw`
      SELECT "id", "organizer_id" AS "organizerId"
      FROM "events"
      WHERE "id" = ${eventId}::uuid
      FOR UPDATE
    `;
    const event = lockedEvents[0];

    if (!event || event.organizerId !== organizerId) {
      throw notFoundError();
    }

    if (eventData.capacity !== undefined) {
      const confirmedBookings = await transaction.booking.count({
        where: {
          eventId,
          status: BookingStatus.CONFIRMED
        }
      });

      if (eventData.capacity < confirmedBookings) {
        const error = new Error(
          `Capacity cannot be lower than ${confirmedBookings} confirmed bookings`
        );
        error.statusCode = 409;
        throw error;
      }
    }

    const updatedEvent = await transaction.event.update({
      where: {
        id: eventId
      },
      data: eventData,
      select: organizerEventFields
    });

    return formatOrganizerEvent(updatedEvent);
  });
}

async function listEventAttendees(organizerId, eventId) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizerId
    },
    select: {
      id: true,
      title: true,
      bookings: {
        where: {
          status: BookingStatus.CONFIRMED
        },
        select: {
          id: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  if (!event) {
    throw notFoundError();
  }

  return {
    event: {
      id: event.id,
      title: event.title
    },
    attendees: event.bookings.map((booking) => ({
      bookingId: booking.id,
      bookedAt: booking.createdAt,
      ...booking.user
    }))
  };
}

module.exports = {
  createOrganizerEvent,
  listEventAttendees,
  listOrganizerEvents,
  updateOrganizerEvent
};
