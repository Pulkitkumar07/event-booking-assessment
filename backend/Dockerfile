FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN npm ci

COPY backend backend

RUN npm run prisma:generate --workspace backend

EXPOSE 4000

CMD ["sh", "-c", "node backend/prisma/docker-start.js && npm run start --workspace backend"]
