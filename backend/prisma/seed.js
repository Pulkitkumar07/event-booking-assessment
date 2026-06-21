const bcrypt = require("bcryptjs");
const {
  PrismaClient,
  UserRole,
  BookingStatus,
  ActivityType
} = require("@prisma/client");

const prisma = new PrismaClient();

function daysFromNow(days, hour) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function main() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "activity_log", "bookings", "events", "users" RESTART IDENTITY CASCADE'
  );

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const organizer = await prisma.user.create({
    data: {
      name: "Demo Organizer",
      email: "organizer@example.com",
      passwordHash,
      role: UserRole.ORGANIZER
    }
  });

  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "user@example.com",
      passwordHash,
      role: UserRole.USER
    }
  });

  const secondUser = await prisma.user.create({
    data: {
      name: "Second User",
      email: "user2@example.com",
      passwordHash,
      role: UserRole.USER
    }
  });

  const musicEvent = await prisma.event.create({
    data: {
      organizerId: organizer.id,
      title: "Summer Music Night",
      description: "An evening of live music from local artists.",
      venue: "City Auditorium",
      startsAt: daysFromNow(14, 18),
      capacity: 100,
      price: "499.00"
    }
  });

  const techEvent = await prisma.event.create({
    data: {
      organizerId: organizer.id,
      title: "JavaScript Community Meetup",
      description: "Short talks and networking for JavaScript developers.",
      venue: "Tech Hub",
      startsAt: daysFromNow(21, 10),
      capacity: 50,
      price: "0.00"
    }
  });

  await prisma.event.create({
    data: {
      organizerId: organizer.id,
      title: "Weekend Food Festival",
      description: "Food stalls, live cooking, and family activities.",
      venue: "Central Park",
      startsAt: daysFromNow(30, 12),
      capacity: 200,
      price: "199.00"
    }
  });

  await prisma.booking.createMany({
    data: [
      {
        userId: user.id,
        eventId: musicEvent.id,
        status: BookingStatus.CONFIRMED
      },
      {
        userId: secondUser.id,
        eventId: musicEvent.id,
        status: BookingStatus.CONFIRMED
      },
      {
        userId: user.id,
        eventId: techEvent.id,
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date()
      }
    ]
  });

  await prisma.activityLog.createMany({
    data: [
      { eventId: musicEvent.id, userId: user.id, type: ActivityType.EVENT_VIEWED },
      { eventId: musicEvent.id, userId: secondUser.id, type: ActivityType.EVENT_VIEWED },
      { eventId: musicEvent.id, userId: user.id, type: ActivityType.BOOKING_STARTED },
      { eventId: musicEvent.id, userId: user.id, type: ActivityType.BOOKING_CONFIRMED },
      { eventId: musicEvent.id, userId: secondUser.id, type: ActivityType.BOOKING_STARTED },
      { eventId: musicEvent.id, userId: secondUser.id, type: ActivityType.BOOKING_CONFIRMED },
      { eventId: techEvent.id, userId: user.id, type: ActivityType.EVENT_VIEWED },
      { eventId: techEvent.id, userId: user.id, type: ActivityType.BOOKING_STARTED },
      { eventId: techEvent.id, userId: user.id, type: ActivityType.BOOKING_CONFIRMED },
      { eventId: techEvent.id, userId: user.id, type: ActivityType.BOOKING_CANCELLED }
    ]
  });

  console.log("Seed completed.");
  console.log("Organizer: organizer@example.com / Password123!");
  console.log("User: user@example.com / Password123!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
