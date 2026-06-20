# BookIt

BookIt is a full-stack live-event booking platform built with Next.js,
Express, and PostgreSQL.

- Frontend: Next.js with TypeScript
- Backend: Express with JavaScript (CommonJS)

## Project structure

```text
booking-app/
├── frontend/            Next.js web application
├── backend/             Express API
├── docker-compose.yml   Local PostgreSQL service
└── package.json         Monorepo commands
```

## Prerequisites

- Node.js 24 or newer
- npm 11 or newer
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

## Postman

Import these two files into Postman:

- `postman/BookIt.postman_collection.json`
- `postman/BookIt.local.postman_environment.json`

Select the **BookIt Local** environment before sending requests. Postman will
store the authentication cookie after signup or login and send it with
protected requests automatically.

The health endpoint is currently available. The remaining requests document
the required API surface and will become usable as each feature is implemented.
