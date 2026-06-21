const { ActivityType, BookingStatus } = require("@prisma/client");
const { prisma } = require("../config/database");

const eventListFields = {
  id: true,
  title: true,
  venue: true,
  startsAt: true,
  capacity: true,
  price: true,
  organizer: {
    select: {
      id: true,
      name: true
    }
  },
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

function formatEvent(event) {
  const confirmedBookings = event._count.bookings;
  const seatsRemaining = Math.max(event.capacity - confirmedBookings, 0);

  return {
    id: event.id,
    title: event.title,
    venue: event.venue,
    startsAt: event.startsAt,
    capacity: event.capacity,
    price: event.price.toString(),
    organizer: event.organizer,
    confirmedBookings,
    seatsRemaining,
    soldOut: seatsRemaining === 0
  };
}

async function listUpcomingEvents({ search, date, page, limit }) {
  const now = new Date();
  const where = {
    startsAt: {
      gte: now
    }
  };

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive"
    };
  }

  if (date) {
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    where.startsAt = {
      gte: dayStart > now ? dayStart : now,
      lt: dayEnd
    };
  }

  const skip = (page - 1) * limit;
  const [events, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      select: eventListFields,
      orderBy: [{ startsAt: "asc" }, { id: "asc" }],
      skip,
      take: limit
    }),
    prisma.event.count({ where })
  ]);

  return {
    events: events.map(formatEvent),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function getEventDetails(eventId, userId) {
  const event = await prisma.event.findUnique({
    where: {
      id: eventId
    },
    select: {
      ...eventListFields,
      description: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!event) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.activityLog.create({
    data: {
      eventId: event.id,
      userId: userId ?? null,
      type: ActivityType.EVENT_VIEWED
    }
  });

  return {
    ...formatEvent(event),
    description: event.description,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt
  };
}

module.exports = {
  getEventDetails,
  listUpcomingEvents
};
