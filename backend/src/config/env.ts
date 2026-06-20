import "dotenv/config";

function getPort(value: string | undefined): number {
  const port = Number(value ?? 4000);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return port;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: getPort(process.env.PORT),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000"
};
