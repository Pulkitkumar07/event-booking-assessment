const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const { env } = require("./config/env");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true
  })
);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "bookit-api"
  });
});

app.use((_request, response) => {
  response.status(404).json({
    error: {
      message: "Route not found"
    }
  });
});

module.exports = { app };
