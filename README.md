# BookIt

BookIt is a full-stack event booking application. Users can browse events,
reserve seats, and manage their bookings. Organizers can create and edit
events, view attendees, and review event analytics.

The booking flow uses a PostgreSQL transaction and row-level locking so an
event cannot be booked beyond its capacity, even when multiple users try to
book the final seat at the same time.

## Technology

- Frontend: Next.js, React, Redux Toolkit, Axios, and React Hook Form
- Backend: Node.js 24, Express, and CommonJS
- Database: PostgreSQL and Prisma ORM
- Authentication: JWT stored in an HTTP-only cookie
- Language: JavaScript

## Features

- User and organizer signup, login, logout, and session handling
- Event search, date filtering, pagination, and event details
- Live seat availability and concurrency-safe booking
- Duplicate-booking and sold-out protection
- User booking history and booking cancellation
- Organizer event creation, editing, attendee lists, and ownership checks
- Event analytics derived from the activity log

## Project structure

```text
booking-app/
├── backend/             Express API, Prisma schema, migrations, and seed
├── frontend/            Next.js application
├── postman/             Postman collection and local environment
├── docker-compose.yml   Local PostgreSQL service
└── package.json         Shared project commands
```

## Prerequisites

- Node.js 24 or newer
- npm 11 or newer
- Docker Desktop with Docker Compose

Check the installed versions:

```bash
node --version
npm --version
docker --version
docker compose version
```

## Run locally

### Quick start with Docker

Make sure Docker Desktop is running, then run this single command from the
project root:

```bash
docker compose up --build
```

Docker Compose will:

- Start PostgreSQL
- Apply existing Prisma migrations
- Seed demo data when the database is empty
- Build and start the Express backend
- Build and start the Next.js frontend

Open http://localhost:3000 after all services have started.

Docker exposes the backend API at http://localhost:4100/api and its health
check at http://localhost:4100/api/health.

Stop the project with `Ctrl+C`, then remove the running containers with:

```bash
docker compose down
```

The PostgreSQL data is kept in a Docker volume, so bookings and other changes
remain available the next time the project starts.

### Run without Docker

Use these steps when PostgreSQL is already installed locally.

First, install dependencies and create the environment files:

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Update `DATABASE_URL` in `backend/.env` when your local PostgreSQL credentials
are different. Then run:

```bash
npm run db:migrate:deploy
npm run db:seed
npm run dev
```

The manual setup exposes:

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Health check: http://localhost:4000/api/health

The manual seed command resets the application tables before inserting demo
data. Do not run it against a database containing data you want to keep.

## Demo accounts

All seeded accounts use the password `Password123!`.

| Role | Email |
| --- | --- |
| Organizer | `organizer@example.com` |
| User | `user@example.com` |
| User | `user2@example.com` |

## Database commands

Run these commands from the project root:

```bash
# Create and apply a migration during development
npm run db:migrate

# Apply existing migrations
npm run db:migrate:deploy

# Reset the application tables and insert demo data
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## Validation commands

```bash
npm run lint
npm run build
npm run check
```

`npm run check` runs both linting and the production build.

## Common setup issues

### Backend cannot connect to PostgreSQL

Check that the container is healthy:

```bash
docker compose ps
```

For the manual, non-Docker setup, confirm that `backend/.env` contains the
correct URL for your local PostgreSQL server. The default example is:

```env
DATABASE_URL=postgresql://bookit:bookit@localhost:5432/bookit-v1
```

### Start with a completely new Docker database

This command deletes the Docker database volume and all of its data:

```bash
docker compose down -v
docker compose up -d postgres
npm run db:migrate:deploy
npm run db:seed
```
