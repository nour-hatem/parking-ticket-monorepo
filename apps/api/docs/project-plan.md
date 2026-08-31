# Parking Ticket API — Complete Project Plan

> **Primary Goal:** Learn and apply NestJS concepts by building a real, production-ready REST API.
> Every concept practiced here maps directly to the real Walking Spine project.

---

## Project Overview

**Name:** Parking Ticket API  
**Tech Stack:** NestJS (ESM) · TypeScript · PostgreSQL · Redis · TypeORM · Docker Compose · JWT  
**Purpose:** Issue and manage parking tickets, track plates, and log audit events.

### Final Endpoint Map

```
POST   /auth/login              → Login and receive JWT
POST   /tickets                 → Create a new ticket       [operator]
GET    /tickets                 → List all tickets           [operator, admin]
GET    /tickets/:id             → Get ticket by ID           [operator, admin]
PUT    /tickets/:id/status      → Update ticket status       [admin]
GET    /audit                   → View audit log             [admin]
GET    /health                  → Service health check       [public]
GET    /api/docs                → Swagger UI                 [public]
```

---

## Project Structure (Final)

```
src/
├── main.ts
├── app.module.ts
├── tickets/
│   ├── tickets.module.ts
│   ├── tickets.controller.ts
│   ├── tickets.service.ts
│   ├── ticket.entity.ts
│   ├── dto/
│   │   ├── create-ticket.dto.ts
│   │   └── update-ticket-status.dto.ts
│   ├── interfaces/
│   │   └── ticket.interface.ts
│   ├── ports/
│   │   └── plate-lookup.port.ts
│   ├── adapters/
│   │   └── fake-plate-lookup.adapter.ts
│   └── events/
│       └── ticket-created.event.ts
├── audit/
│   ├── audit.module.ts
│   ├── audit.listener.ts
│   └── audit.entity.ts
└── auth/
    ├── auth.module.ts
    ├── auth.controller.ts
    ├── auth.service.ts
    ├── strategies/
    │   └── jwt.strategy.ts
    └── guards/
        ├── jwt-auth.guard.ts
        └── roles.guard.ts
docs/
├── project-plan.md             ← this file
docker-compose.yml
Dockerfile
.env
.env.example
```

---

## Phase 0 — Bootstrap ✅ DONE

**Goal:** Scaffold the project and push to GitHub.

### What was done:
- Installed NestJS CLI: `npm i -g @nestjs/cli`
- Created project: `nest new . --skip-git`
- Selected: ESM modules + Vitest + npm
- Verified server runs: `npm run start:dev` → `Hello World!` on port 3000
- Configured `.gitignore` and pushed to GitHub

### NestJS Concepts Learned:
| Concept | Description |
|---------|-------------|
| Module | Groups related controllers, services, and providers |
| Controller | Handles incoming HTTP requests and returns responses |
| Service | Contains the business logic (injectable class) |
| `npm run start:dev` | Watch mode — auto-restarts on file changes |

---

## Phase 1 — Core CRUD (In-Memory)

**Goal:** Build the full tickets CRUD with DTOs, validation, and error handling — no database yet.

### Steps:

#### 1.1 Generate Tickets Feature
```bash
nest generate module tickets
nest generate controller tickets
nest generate service tickets
```

#### 1.2 Define the Ticket Interface
```typescript
// src/tickets/interfaces/ticket.interface.ts
export interface Ticket {
  id: string;
  plate: string;
  status: 'waiting' | 'paid' | 'cancelled';
  createdAt: Date;
}
```

#### 1.3 Create DTOs with Validation
```bash
npm install class-validator class-transformer
```

```typescript
// src/tickets/dto/create-ticket.dto.ts
export class CreateTicketDto {
  @IsString()
  @Matches(/^[A-Z]{1,3}-\d{1,4}$/, { message: 'plate must be like ABC-1234' })
  plate: string;
}
```

Enable globally in `main.ts`:
```typescript
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

#### 1.4 TicketsService (In-Memory Storage)
```typescript
@Injectable()
export class TicketsService {
  private tickets: Ticket[] = [];

  create(plate: string): Ticket { ... }
  findAll(): Ticket[] { ... }
  findOne(id: string): Ticket { ... }   // throws NotFoundException if missing
}
```

#### 1.5 TicketsController
```typescript
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()   create(@Body() dto: CreateTicketDto) { ... }
  @Get()    findAll() { ... }
  @Get(':id') findOne(@Param('id') id: string) { ... }
}
```

### NestJS Concepts Learned:
| Concept | Description |
|---------|-------------|
| `@Controller()` | Declares a class as a route handler |
| `@Get()`, `@Post()` | HTTP method decorators |
| `@Body()`, `@Param()`, `@Query()` | Extract data from the request |
| DTO | Shape of data coming from the client |
| `class-validator` | Validates DTO fields via decorators |
| `ValidationPipe` | Applies validation globally to all endpoints |
| `whitelist: true` | Strips unknown properties from the body |
| `NotFoundException` | Returns 404 automatically |
| Constructor Injection | The standard way to inject dependencies |

---

## Phase 2 — Adapter Pattern (Ports & Adapters)

**Goal:** Apply the Adapter Design Pattern and Dependency Inversion Principle.

### Why?
`TicketsService` should not care *where* car data comes from (a fake source, SAP, external API). We define a **Port** (interface) and plug in different **Adapters** (implementations).

### Steps:

#### 2.1 Define the Port
```typescript
// src/tickets/ports/plate-lookup.port.ts
export const PLATE_LOOKUP_PORT = Symbol('PLATE_LOOKUP_PORT');

export interface CarInfo {
  ownerName: string;
  carModel: string;
  isBlacklisted: boolean;
}

export interface IPlateLookupPort {
  lookup(plate: string): CarInfo | null;
}
```

#### 2.2 Build the FakePlateLookupAdapter
```typescript
// src/tickets/adapters/fake-plate-lookup.adapter.ts
@Injectable()
export class FakePlateLookupAdapter implements IPlateLookupPort {
  lookup(plate: string): CarInfo | null {
    const data: Record<string, CarInfo> = {
      'ABC-1234': { ownerName: 'Ahmed Ali', carModel: 'Toyota', isBlacklisted: false },
      'XYZ-9999': { ownerName: 'Unknown',   carModel: 'Unknown', isBlacklisted: true },
    };
    return data[plate] ?? null;
  }
}
```

#### 2.3 Register in Module
```typescript
providers: [
  TicketsService,
  { provide: PLATE_LOOKUP_PORT, useClass: FakePlateLookupAdapter },
]
```

#### 2.4 Inject in Service
```typescript
constructor(
  @Inject(PLATE_LOOKUP_PORT)
  private readonly plateLookup: IPlateLookupPort,
) {}
```

### NestJS Concepts Learned:
| Concept | Description |
|---------|-------------|
| Interface as Port | Contract between layers — defines *what*, not *how* |
| Adapter | Concrete implementation of a Port |
| `Symbol` token | Unique, collision-free injection token |
| `@Inject(TOKEN)` | Used when the token is not a class |
| Dependency Inversion | High-level modules depend on abstractions, not implementations |
| Swapping adapters | Change one line in the Module to switch implementations |

---

## Phase 3 — Database & Migrations (PostgreSQL + TypeORM)

**Goal:** Replace in-memory storage with a real PostgreSQL database via TypeORM.

### Steps:

#### 3.1 Docker Compose Setup
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: parking
      POSTGRES_PASSWORD: parking123
      POSTGRES_DB: parking_db
    ports: ['5432:5432']
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']

volumes:
  postgres_data:
```
```bash
docker compose up -d
```

#### 3.2 Environment Config
```bash
npm install @nestjs/config
```
```ini
# .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=parking
DATABASE_PASSWORD=parking123
DATABASE_NAME=parking_db
JWT_SECRET=super_secret_at_least_32_chars_long
```

#### 3.3 TypeORM + Entity
```bash
npm install @nestjs/typeorm typeorm pg
```
```typescript
// src/tickets/ticket.entity.ts
@Entity('tickets')
export class TicketEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() plate: string;
  @Column({ default: 'waiting' }) status: string;
  @CreateDateColumn() createdAt: Date;
}
```

#### 3.4 Migrations
```bash
npm run migration:generate -- src/migrations/CreateTicketsTable
npm run migration:run
```

### NestJS / Database Concepts Learned:
| Concept | Description |
|---------|-------------|
| `docker compose up` | Starts all services defined in docker-compose.yml |
| `ConfigModule` | Loads `.env` variables into the app |
| `isGlobal: true` | Makes ConfigModule available everywhere without re-importing |
| TypeORM Entity | A class that maps to a database table |
| Repository | Abstraction over DB queries for an entity |
| Migration | Version-controlled DB schema change (with rollback) |
| `synchronize: false` | Never auto-sync schema in production; use migrations |

---

## Phase 4 — Event Bus & Audit Log

**Goal:** Decouple ticket creation from audit logging using an event bus.

### Steps:

#### 4.1 Install EventEmitter2
```bash
npm install @nestjs/event-emitter
```

#### 4.2 Define the Event
```typescript
// src/tickets/events/ticket-created.event.ts
export class TicketCreatedEvent {
  constructor(
    public readonly ticketId: string,
    public readonly plate: string,
    public readonly createdAt: Date,
  ) {}
}
```

#### 4.3 Emit from Service
```typescript
this.eventEmitter.emit('ticket.created', new TicketCreatedEvent(...));
```

#### 4.4 Listen in AuditModule
```typescript
@OnEvent('ticket.created')
async handleTicketCreated(event: TicketCreatedEvent) {
  await this.auditRepo.save({ action: 'ticket.created', entityId: event.ticketId });
}
```

### NestJS Concepts Learned:
| Concept | Description |
|---------|-------------|
| Event-Driven Architecture | Components communicate through events, not direct calls |
| `EventEmitter2` | NestJS wrapper for event pub/sub |
| `@OnEvent()` | Decorator to register an event listener |
| Decoupling | TicketsService has zero knowledge of AuditListener |

---

## Phase 5 — Auth & Authorization

**Goal:** Protect all endpoints with JWT. Add role-based access control.

### Steps:

#### 5.1 Install Packages
```bash
npm install @nestjs/passport passport passport-jwt @nestjs/jwt
npm install -D @types/passport-jwt
```

#### 5.2 Auth Flow
```
POST /auth/login  →  validate credentials  →  return { access_token: JWT }
All other routes  →  JwtAuthGuard validates token  →  allow or reject (401)
Role-restricted   →  RolesGuard checks metadata   →  allow or reject (403)
```

#### 5.3 Protecting a Route
```typescript
@Post()
@Roles('operator', 'admin')
@UseGuards(JwtAuthGuard, RolesGuard)
create(@Body() dto: CreateTicketDto) { ... }
```

### NestJS Concepts Learned:
| Concept | Description |
|---------|-------------|
| Authentication | Verifying *who* the user is (JWT) |
| Authorization | Verifying *what* they can do (Roles) |
| `Guard` | Runs before the route handler; returns true/false |
| `canActivate()` | Method every Guard must implement |
| `@Roles()` | Custom decorator that attaches metadata to a route |
| `Reflector` | Reads metadata inside a Guard |
| JWT Payload | Data embedded in the token (userId, role, exp) |

---

## Phase 6 — Production Ready

**Goal:** Make the app deployable, documented, observable, and maintainable.

### 6.1 Swagger / OpenAPI
```bash
npm install @nestjs/swagger
```
→ Auto-generates interactive API docs at `GET /api/docs`

### 6.2 Config Validation (Joi)
```bash
npm install joi
```
→ App crashes at startup if required env vars are missing or invalid.

### 6.3 Structured Logging
```bash
npm install pino pino-pretty nestjs-pino
```
→ JSON logs with request tracing — replaces `console.log`.

### 6.4 Health Checks
```bash
npm install @nestjs/terminus
```
→ `GET /health` returns status of DB and Redis.

### 6.5 Production Dockerfile
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main"]
```

### NestJS / DevOps Concepts Learned:
| Concept | Description |
|---------|-------------|
| Swagger decorators | `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth` |
| Config validation | Schema-based env var validation at startup |
| Multi-stage Docker | Smaller final image by separating build from runtime |
| Health checks | Programmatic verification that dependencies are alive |
| Structured logging | Machine-readable logs for production observability |

---

## NestJS Concepts Master Table

| Concept | Phase | Priority |
|---------|-------|----------|
| Module / Controller / Service | 1 | ⭐⭐⭐⭐⭐ |
| Dependency Injection | 1–2 | ⭐⭐⭐⭐⭐ |
| DTOs + class-validator | 1 | ⭐⭐⭐⭐⭐ |
| ValidationPipe | 1 | ⭐⭐⭐⭐⭐ |
| HTTP Exceptions | 1 | ⭐⭐⭐⭐⭐ |
| Adapter Pattern / Ports | 2 | ⭐⭐⭐⭐⭐ |
| Custom Injection Tokens | 2 | ⭐⭐⭐⭐ |
| TypeORM Entities + Repos | 3 | ⭐⭐⭐⭐⭐ |
| Migrations | 3 | ⭐⭐⭐⭐ |
| Docker Compose | 3 | ⭐⭐⭐⭐ |
| EventEmitter2 | 4 | ⭐⭐⭐⭐⭐ |
| Event-Driven Decoupling | 4 | ⭐⭐⭐⭐⭐ |
| JWT Auth | 5 | ⭐⭐⭐⭐⭐ |
| Guards | 5 | ⭐⭐⭐⭐⭐ |
| Custom Decorators | 5 | ⭐⭐⭐⭐ |
| Swagger | 6 | ⭐⭐⭐ |
| Structured Logging | 6 | ⭐⭐⭐ |
| Multi-stage Docker | 6 | ⭐⭐⭐ |

---

## Progress Tracker

- [x] Phase 0 — Bootstrap
- [ ] Phase 1 — Core CRUD (In-Memory)
- [ ] Phase 2 — Adapter Pattern
- [ ] Phase 3 — Database & Migrations
- [ ] Phase 4 — Event Bus & Audit
- [ ] Phase 5 — Auth & Authorization
- [ ] Phase 6 — Production Ready
