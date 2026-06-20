# BookIt

BookIt is a full-stack live-event booking platform built with Next.js,
Express, and PostgreSQL.

## Project structure

```text
booking-app/
├── frontend/            Next.js web application
├── backend/             Express API
├── docker-compose.yml   Local PostgreSQL service
└── package.json         Monorepo commands
```

## Prerequisites

- Node.js 18.18 or newer
- npm 9 or newer
- Docker Desktop or another Docker Compose-compatible runtime

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local environment files:

   ```bash
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   ```

3. Start PostgreSQL:

   ```bash
   docker compose up -d postgres
   ```

4. Start the frontend and backend:

   ```bash
   npm run dev
   ```

The frontend runs at `http://localhost:3000`. The API runs at
`http://localhost:4000`, with a health check at
`http://localhost:4000/api/health`.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

Database migrations and seed commands will be added with the database schema
milestone.
