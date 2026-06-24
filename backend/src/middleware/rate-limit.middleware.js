const rateLimit = require("express-rate-limit");

const commonOptions = {
  standardHeaders: true,
  legacyHeaders: false
};

const authRateLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    error: {
      message: "Too many login or signup attempts. Please try again later."
    }
  }
});

const bookingRateLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 1000,
  limit: 10,
  message: {
    error: {
      message: "Too many booking attempts. Please try again later."
    }
  }
});

module.exports = {
  authRateLimiter,
  bookingRateLimiter
};
