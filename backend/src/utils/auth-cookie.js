const { env } = require("../config/env");

const AUTH_COOKIE_NAME = "bookit_token";

function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

module.exports = {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions
};
