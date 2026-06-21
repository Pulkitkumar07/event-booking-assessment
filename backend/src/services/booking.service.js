const {
  ActivityType,
  BookingStatus,
  Prisma
} = require("@prisma/client");
const { prisma } = require("../config/database");

function conflictError(message) {
  const error = new Error(message);
  error.statusCode = 409;
  return error;
}

async function bookEvent(eventId, userId) {
  const eventExists = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      startsAt: true
    }
  });

  if (!eventExists) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  if (eventExists.startsAt <= new Date()) {
    throw conflictError("This event has already started");
  }

  await prisma.activityLog.create({
    data: {
      eventId,
      userId,
      type: ActivityType.BOOKING_STARTED
    }
  });

  try {
    return await prisma.$transaction(async (transaction) => {
      const lockedEvents = await transaction.$queryRaw`
        SELECT "id", "capacity", "starts_at" AS "startsAt"
        FROM "events"
        WHERE "id" = ${eventId}::uuid
        FOR UPDATE
      `;
      const event = lockedEvents[0];

      if (!event) {
        const error = new Error("Event not found");
        error.statusCode = 404;
        throw error;
      }

      if (event.startsAt <= new Date()) {
        throw conflictError("This event has already started");
      }

      const existingBooking = await transaction.booking.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId
          }
        },
        select: {
          id: true,
          status: true
        }
      });

      if (existingBooking?.status === BookingStatus.CONFIRMED) {
        throw conflictError("You have already booked this event");
      }

      const confirmedBookings = await transaction.booking.count({
        where: {
          eventId,
          status: BookingStatus.CONFIRMED
        }
      });

      if (confirmedBookings >= event.capacity) {
        throw conflictError("This event is sold out");
      }

      const bookingFields = {
        id: true,
        eventId: true,
        status: true,
        createdAt: true
      };
      const booking = existingBooking
        ? await transaction.booking.update({
            where: {
              id: existingBooking.id
            },
            data: {
              status: BookingStatus.CONFIRMED,
              cancelledAt: null
            },
            select: bookingFields
          })
        : await transaction.booking.create({
            data: {
              eventId,
              userId,
              status: BookingStatus.CONFIRMED
            },
            select: bookingFields
          });

      await transaction.activityLog.create({
        data: {
          eventId,
          userId,
          type: ActivityType.BOOKING_CONFIRMED
        }
      });

      return {
        booking,
        seatsRemaining: event.capacity - confirmedBookings - 1
      };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw conflictError("You have already booked this event");
      }
    }

    throw error;
  }
}

async function listUserBookings(userId) {
  const bookings = await prisma.booking.findMany({
    where: {
      userId
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      cancelledAt: true,
      event: {
        select: {
          id: true,
          title: true,
          venue: true,
          startsAt: true,
          price: true,
          organizer: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return bookings.map((booking) => ({
    ...booking,
    event: {
      ...booking.event,
      price: booking.event.price.toString()
    }
  }));
}

async function cancelBooking(bookingId, userId) {
  const bookingReference = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId
    },
    select: {
      eventId: true
    }
  });

  if (!bookingReference) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.$transaction(async (transaction) => {
    const lockedEvents = await transaction.$queryRaw`
      SELECT "id", "capacity"
      FROM "events"
      WHERE "id" = ${bookingReference.eventId}::uuid
      FOR UPDATE
    `;

    if (!lockedEvents[0]) {
      const error = new Error("Event not found");
      error.statusCode = 404;
      throw error;
    }

    const lockedBookings = await transaction.$queryRaw`
      SELECT "id", "event_id" AS "eventId", "status"
      FROM "bookings"
      WHERE "id" = ${bookingId}::uuid
        AND "user_id" = ${userId}::uuid
      FOR UPDATE
    `;
    const booking = lockedBookings[0];

    if (!booking) {
      const error = new Error("Booking not found");
      error.statusCode = 404;
      throw error;
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw conflictError("This booking is already cancelled");
    }

    const cancelledAt = new Date();
    const updatedBooking = await transaction.booking.update({
      where: {
        id: bookingId
      },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt
      },
      select: {
        id: true,
        eventId: true,
        status: true,
        cancelledAt: true
      }
    });

    await transaction.activityLog.create({
      data: {
        eventId: booking.eventId,
        userId,
        type: ActivityType.BOOKING_CANCELLED
      }
    });

    const confirmedBookings = await transaction.booking.count({
      where: {
        eventId: booking.eventId,
        status: BookingStatus.CONFIRMED
      }
    });

    return {
      booking: updatedBooking,
      seatsRemaining: lockedEvents[0].capacity - confirmedBookings
    };
  });
}

module.exports = {
  bookEvent,
  cancelBooking,
  listUserBookings
};
