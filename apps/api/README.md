# Parking Ticket API

A NestJS REST API for managing parking tickets and users. Built as a learning project to understand NestJS patterns end-to-end — modules, guards, adapters, events, and production hardening.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22, TypeScript 6 |
| Framework | NestJS 12, Express adapter |
| Database | PostgreSQL via Prisma Postgres (cloud) |
| ORM | Prisma 6 with `@prisma/adapter-pg` driver adapter |
| Auth | JWT (RS256), Passport.js, bcrypt |
| Authorization | Role-based access control (RBAC) via custom `RolesGuard` |
| Config validation | Joi |
| Logging | nestjs-pino (structured JSON, pino-pretty in dev) |
| Health checks | `@nestjs/terminus` (database + heap memory) |
| API docs | `@nestjs/swagger` (OpenAPI 3.0) |
| Security | Arcjet (rate limiting, bot detection — DRY_RUN mode) |

## Roles

| Role | Can do |
|---|---|
| `ADMIN` | Create tickets |
| `OPERATOR` | Create tickets |
| `USER` | Read tickets |

All ticket and auth profile endpoints require a valid JWT. Ticket creation is restricted to `ADMIN` and `OPERATOR`.

## Endpoints

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | None | Register a new user |
| `POST` | `/auth/login` | None | Log in, returns `access_token` |
| `GET` | `/auth/profile` | JWT | Returns the authenticated user's profile |

### Tickets

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `POST` | `/tickets` | JWT | ADMIN, OPERATOR | Create a new parking ticket |
| `GET` | `/tickets` | JWT | Any | List all tickets |
| `GET` | `/tickets/:id` | JWT | Any | Get one ticket by UUID |

### System

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | None | Database + memory health probe |
| `GET` | `/api/docs` | None | Swagger UI |

## Running Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in the required values in `.env`:

```env
# Required — get this from Prisma Postgres or use a local PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Required — use a long random string
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d

# Optional — ArcJet rate limiting (leave as DRY_RUN for local dev)
ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development
ARCJET_MODE=DRY_RUN
```

### 3. Push the schema to the database

```bash
npx prisma db push
```

This syncs the `prisma/schema.prisma` definitions to your database without running migrations. Use this for local dev and Prisma Postgres.

### 4. Seed initial data (optional)

```bash
npx prisma db seed
```

Seeds two users (`admin@parking.com` and `officer@parking.com`, password `password123`) and two tickets.

### 5. Start the development server

```bash
npm run start:dev
```

Server starts on `http://localhost:3000`. Swagger UI is at `http://localhost:3000/api/docs`.

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | Full PostgreSQL connection string |
| `JWT_SECRET` | ✅ | — | Secret used to sign JWT tokens |
| `JWT_EXPIRES_IN` | No | `1d` | JWT expiry duration |
| `ARCJET_KEY` | No | — | Arcjet API key |
| `ARCJET_ENV` | No | `development` | Arcjet environment |
| `ARCJET_MODE` | No | `DRY_RUN` | `DRY_RUN` logs but doesn't block; `LIVE` enforces |
| `NODE_ENV` | No | `development` | Controls log formatting |
| `PORT` | No | `3000` | Server port |

## Running the Test Script

A shell script that exercises every endpoint end-to-end is included:

```bash
./scripts/postman-test.sh
```

Requires `curl` and `jq`. Runs register, login, create ticket, list tickets, fetch by ID, RBAC rejection (403), and unauthenticated rejection (401).

## Docker

Build the production image:

```bash
docker build -t parking-ticket-api .
```

The `Dockerfile` uses a multi-stage build. Stage 1 compiles TypeScript; stage 2 installs production dependencies only and runs as the `node` user.

The image expects `DATABASE_URL`, `JWT_SECRET`, and the other required env vars to be injected at runtime.

## Project Structure

```
src/
├── main.ts                          # Bootstrap: Pino logger, Swagger, ValidationPipe
├── app.module.ts                    # Root module
├── common/
│   ├── config/config.schema.ts      # Joi env validation schema
│   ├── decorators/                  # @Roles(), @GetUser()
│   └── guards/                      # JwtAuthGuard, RolesGuard
├── auth/                            # JWT login, register, Passport strategy
├── tickets/                         # CRUD, adapter pattern, event emitter
├── health/                          # Terminus health controller
└── prisma/                          # PrismaService (global module)

lib/
└── prisma.ts                        # PrismaClient singleton with PrismaPg adapter

prisma/
├── schema.prisma                    # Source of truth for DB schema
└── seed.ts                          # Seed script
```
