const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const helmet = require("helmet");
const { env } = require("./config/env");
const { errorHandler } = require("./middleware/error.middleware");
const { authRouter } = require("./routes/auth.routes");
const {
  bookingRouter,
  meRouter
} = require("./routes/booking.routes");
const { eventRouter } = require("./routes/event.routes");
const { organizerRouter } = require("./routes/organizer.routes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true
  })
);
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "bookit-api"
  });
});

app.use("/api/auth", authRouter);
app.use("/api/events", eventRouter);
app.use("/api/me", meRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/organizer", organizerRouter);

app.use((_request, response) => {
  response.status(404).json({
    error: {
      message: "Route not found"
    }
  });
});

app.use(errorHandler);

module.exports = { app };
