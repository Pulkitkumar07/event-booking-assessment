const {
  createToken,
  createUser,
  verifyUser
} = require("../services/auth.service");
const {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions
} = require("../utils/auth-cookie");

function isPasswordTooLong(password) {
  return Buffer.byteLength(password, "utf8") > 72;
}

function validateSignup(body = {}) {
  const { name, email, password, role = "user" } = body;
  const errors = [];

  if (typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  } else if (name.trim().length > 100) {
    errors.push("Name cannot exceed 100 characters");
  }

  if (
    typeof email !== "string" ||
    email.length > 255 ||
    !/^\S+@\S+\.\S+$/.test(email)
  ) {
    errors.push("A valid email is required");
  }

  if (typeof password !== "string" || password.length < 8) {
    errors.push("Password must be at least 8 characters");
  } else if (isPasswordTooLong(password)) {
    errors.push("Password cannot exceed 72 bytes");
  }

  if (typeof role !== "string" || !["user", "organizer"].includes(role)) {
    errors.push("Role must be user or organizer");
  }

  return errors;
}

function validateLogin(body = {}) {
  const errors = [];

  if (
    typeof body.email !== "string" ||
    body.email.length > 255 ||
    !/^\S+@\S+\.\S+$/.test(body.email)
  ) {
    errors.push("A valid email is required");
  }

  if (typeof body.password !== "string" || body.password.length === 0) {
    errors.push("Password is required");
  } else if (isPasswordTooLong(body.password)) {
    errors.push("Password cannot exceed 72 bytes");
  }

  return errors;
}

function sendValidationError(response, errors) {
  return response.status(400).json({
    error: {
      message: "Validation failed",
      details: errors
    }
  });
}

async function signup(request, response, next) {
  const errors = validateSignup(request.body);

  if (errors.length > 0) {
    return sendValidationError(response, errors);
  }

  try {
    const user = await createUser(request.body);
    const token = createToken(user);

    response.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
    return response.status(201).json({
      message: "Account created successfully",
      user
    });
  } catch (error) {
    return next(error);
  }
}

async function login(request, response, next) {
  const errors = validateLogin(request.body);

  if (errors.length > 0) {
    return sendValidationError(response, errors);
  }

  try {
    const user = await verifyUser(request.body.email, request.body.password);
    const token = createToken(user);

    response.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
    return response.status(200).json({
      message: "Login successful",
      user
    });
  } catch (error) {
    return next(error);
  }
}

function logout(_request, response) {
  const cookieOptions = getAuthCookieOptions();

  response.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite
  });

  return response.status(200).json({
    message: "Logout successful"
  });
}

function getCurrentUser(request, response) {
  return response.status(200).json({
    user: request.user
  });
}

module.exports = {
  getCurrentUser,
  login,
  logout,
  signup
};
