const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserRole } = require("@prisma/client");
const { prisma } = require("../config/database");
const { env } = require("../config/env");

const publicUserFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true
};

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function createUser({ name, email, password, role }) {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: role === "organizer" ? UserRole.ORGANIZER : UserRole.USER
      },
      select: publicUserFields
    });
  } catch (error) {
    if (error.code === "P2002") {
      const duplicateError = new Error(
        "An account with this email already exists"
      );
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
}

async function verifyUser(email, password) {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) }
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

function createToken(user) {
  return jwt.sign({userId: user.id},env.jwtSecret,{expiresIn: env.jwtExpiresIn}
  );
}

module.exports = {
  createToken,
  createUser,
  publicUserFields,
  verifyUser
};
