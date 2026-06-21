const jwt = require("jsonwebtoken");
const { prisma } = require("../config/database");
const { env } = require("../config/env");
const { publicUserFields } = require("../services/auth.service");
const { AUTH_COOKIE_NAME } = require("../utils/auth-cookie");

async function findUserFromToken(token) {
  const payload = jwt.verify(token, env.jwtSecret);

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: publicUserFields
  });
}

async function authenticate(request, response, next) {
  const token = request.cookies[AUTH_COOKIE_NAME];

  if (!token) {
    return response.status(401).json({
      error: {
        message: "Authentication required"
      }
    });
  }

  try {
    const user = await findUserFromToken(token);

    if (!user) {
      return response.status(401).json({
        error: {
          message: "User account no longer exists"
        }
      });
    }

    request.user = user;
    return next();
  } catch (_error) {
    return response.status(401).json({
      error: {
        message: "Invalid or expired authentication"
      }
    });
  }
}

async function optionalAuthenticate(request, _response, next) {
  const token = request.cookies[AUTH_COOKIE_NAME];

  if (!token) {
    request.user = null;
    return next();
  }

  try {
    request.user = await findUserFromToken(token);
  } catch (_error) {
    request.user = null;
  }

  return next();
}

function authorize(...allowedRoles) {
  return function checkRole(request, response, next) {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return response.status(403).json({
        error: {
          message: "You do not have permission to perform this action"
        }
      });
    }

    return next();
  };
}

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize
};
