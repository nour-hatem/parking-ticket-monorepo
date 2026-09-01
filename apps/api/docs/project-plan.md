# Parking Ticket API — Project Plan (NestJS only)

Purpose: learn and apply core NestJS concepts through a real backend project. This project is backend-only — no Next.js, no frontend integration. Every phase must be explained step by step before code is written, since the goal is understanding, not just working code.

Time budget: two days total (Tuesday + Wednesday). Phases 0-4 are mandatory and must be finished by end of Wednesday. Phases 5-6 are optional stretch goals, only if time remains after Phase 4 is fully done and understood.

Decision on Redis: do not include Redis in this project. It would sit unused with no real purpose here (this project only needs durable storage via PostgreSQL), and adding it just to match the real production stack would be scope creep without a learning payoff. Keep docker-compose to PostgreSQL only.

---

## Final Project Structure

Treat this as the target shape. Files under `auth/` only get created if Phase 5 is actually reached; do not scaffold them early.

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
│   │   └── create-ticket.dto.ts
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
│   ├── audit.controller.ts
│   ├── audit.listener.ts
│   └── audit.entity.ts
└── auth/                          # stretch only (Phase 5)
    ├── auth.module.ts
    ├── auth.controller.ts
    ├── auth.service.ts
    ├── strategies/
    │   └── jwt.strategy.ts
    └── guards/
        ├── jwt-auth.guard.ts
        └── roles.guard.ts
docs/
└── project-plan.md               # this file
docker-compose.yml                 # PostgreSQL only
Dockerfile                         # stretch only (Phase 6)
.env
.env.example
```

## Endpoint Map

Core endpoints (Phases 1-4, mandatory):

```
POST   /tickets          → Create a new ticket (rejects blacklisted plates via the adapter)
GET    /tickets          → List all tickets
GET    /tickets/:id      → Get ticket by ID
GET    /audit            → View audit log entries
```

Stretch endpoints (only if Phase 5/6 are reached):

```
POST   /auth/login       → Login and receive JWT (Phase 5)
PUT    /tickets/:id/status → Update ticket status, role-restricted (Phase 5)
GET    /health           → Service health check (Phase 6)
GET    /api/docs         → Swagger UI (Phase 6)
```

## Concepts Reference Table

Use this to sanity-check coverage at the end of each phase.

| Concept | Phase | Required? |
|---|---|---|
| Module / Controller / Service | 1 | Required |
| Dependency Injection | 1-2 | Required |
| DTOs + class-validator | 1 | Required |
| ValidationPipe | 1 | Required |
| HTTP Exceptions | 1 | Required |
| Adapter Pattern / Ports | 2 | Required |
| Custom Injection Tokens (`Symbol`) | 2 | Required |
| TypeORM Entities + Repositories | 3 | Required |
| Migrations | 3 | Required |
| Docker Compose | 3 | Required |
| EventEmitter2 | 4 | Required |
| Event-Driven Decoupling | 4 | Required |
| JWT Auth, Guards, Custom Decorators | 5 | Stretch |
| Swagger, Structured Logging, Health Checks, Multi-stage Docker | 6 | Stretch |

---

## Phase 0 — Bootstrap (done)

- NestJS CLI installed, project scaffolded with ESM + Vitest + npm, server runs on port 3000, Git/GitHub configured.

Concepts already covered: Module, Controller, Service, `start:dev` watch mode.

---

## Phase 1 — Core CRUD (In-Memory)

Goal: full tickets CRUD with DTOs, validation, and error handling — no database yet.

Steps:

1. Generate the feature with the CLI:
```bash
nest generate module tickets
nest generate controller tickets
nest generate service tickets
```
Explain what each command created and where, before moving on.

2. Define the ticket interface:
```typescript
// src/tickets/interfaces/ticket.interface.ts
export interface Ticket {
  id: string;
  plate: string;
  status: 'waiting' | 'paid' | 'cancelled';
  createdAt: Date;
}
```

3. Install and apply validation:
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

4. TicketsService with in-memory storage:
```typescript
@Injectable()
export class TicketsService {
  private tickets: Ticket[] = [];
  create(plate: string): Ticket { /* ... */ }
  findAll(): Ticket[] { /* ... */ }
  findOne(id: string): Ticket { /* throws NotFoundException if missing */ }
}
```

5. TicketsController:
```typescript
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}
  @Post()   create(@Body() dto: CreateTicketDto) { /* ... */ }
  @Get()    findAll() { /* ... */ }
  @Get(':id') findOne(@Param('id') id: string) { /* ... */ }
}
```

6. Manual verification before moving to Phase 2:
```bash
curl -X POST http://localhost:3000/tickets -H "Content-Type: application/json" -d '{"plate":"ABC-1234"}'
curl http://localhost:3000/tickets
curl -X POST http://localhost:3000/tickets -H "Content-Type: application/json" -d '{"plate":"invalid"}'
```
Confirm the success case and the validation-failure case both behave as expected before continuing.

Concepts to explain during this phase: `@Controller()`, `@Get()`/`@Post()`, `@Body()`/`@Param()`, DTO, class-validator, ValidationPipe, `whitelist: true`, NotFoundException, constructor injection.

---

## Phase 2 — Adapter Pattern (Ports & Adapters)

Goal: apply the Adapter Design Pattern and Dependency Inversion. `TicketsService` should not know or care where car data comes from.

1. Define the port:
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

2. Build the fake adapter:
```typescript
// src/tickets/adapters/fake-plate-lookup.adapter.ts
@Injectable()
export class FakePlateLookupAdapter implements IPlateLookupPort {
  lookup(plate: string): CarInfo | null {
    const data: Record<string, CarInfo> = {
      'ABC-1234': { ownerName: 'Ahmed Ali', carModel: 'Toyota', isBlacklisted: false },
      'XYZ-9999': { ownerName: 'Unknown', carModel: 'Unknown', isBlacklisted: true },
    };
    return data[plate] ?? null;
  }
}
```

3. Register in the module:
```typescript
providers: [
  TicketsService,
  { provide: PLATE_LOOKUP_PORT, useClass: FakePlateLookupAdapter },
]
```

4. Inject in the service:
```typescript
constructor(
  @Inject(PLATE_LOOKUP_PORT)
  private readonly plateLookup: IPlateLookupPort,
) {}
```

5. Use it inside `create()`: call `plateLookup.lookup(plate)`, and if `isBlacklisted` is true, reject ticket creation with a `ForbiddenException` and a clear message. The adapter must actually be used in the business logic, not just wired and ignored.

6. Understanding check: create a second fake adapter with different data, and swap it in by changing only the one line in `providers`. Confirm `TicketsService` and `TicketsController` needed zero changes.

Concepts to explain: interface as port, adapter, `Symbol` token, `@Inject(TOKEN)`, dependency inversion, swapping adapters.

---

## Phase 3 — Database & Migrations (PostgreSQL + TypeORM)

Goal: replace in-memory storage with real PostgreSQL via TypeORM.

1. Docker Compose (PostgreSQL only):
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: parking
      POSTGRES_PASSWORD: parking123
      POSTGRES_DB: parking_db
    ports: ['5432:5432']
    volumes: [postgres_data:/var/lib/postgresql/data]
volumes:
  postgres_data:
```
```bash
docker compose up -d
```

2. Environment config:
```bash
npm install @nestjs/config
```
```ini
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=parking
DATABASE_PASSWORD=parking123
DATABASE_NAME=parking_db
```

3. TypeORM entity:
```bash
npm install @nestjs/typeorm typeorm pg
```
```typescript
@Entity('tickets')
export class TicketEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() plate: string;
  @Column({ default: 'waiting' }) status: string;
  @CreateDateColumn() createdAt: Date;
}
```

4. Replace the in-memory array in `TicketsService` with a `Repository<TicketEntity>`. This is the core step of the phase — do not leave it for later.

5. Migrations:
```bash
npm run migration:generate -- src/migrations/CreateTicketsTable
npm run migration:run
```
Explain why `synchronize: false` matters (auto-sync can silently drop or alter production data; migrations are explicit and reviewable).

Concepts to explain: `docker compose up`, ConfigModule and `isGlobal: true`, TypeORM entity, repository, migration, `synchronize: false`.

---

## Phase 4 — Event Bus & Audit Log

Goal: decouple ticket creation from audit logging using an event bus.

1. Install:
```bash
npm install @nestjs/event-emitter
```

2. Define the event:
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

3. Emit from the service:
```typescript
this.eventEmitter.emit('ticket.created', new TicketCreatedEvent(...));
```

4. Build a separate `AuditModule` with its own entity and migration, and listen for the event:
```typescript
@OnEvent('ticket.created')
async handleTicketCreated(event: TicketCreatedEvent) {
  await this.auditRepo.save({ action: 'ticket.created', entityId: event.ticketId });
}
```

5. Add a `GET /audit` endpoint that returns all recorded entries, so the audit trail is provable, not just theoretical.

6. Understanding check: confirm `TicketsService` has zero import of `AuditModule` and vice versa — the only connection between them is the event. This is the point of the pattern.

Concepts to explain: event-driven architecture, `EventEmitter2`, `@OnEvent()`, decoupling.

---

## Phase 5 — Auth & Authorization (stretch, optional)

Only attempt this if Phases 1-4 are fully done and understood well before Wednesday night ends.

- JWT login endpoint, `JwtAuthGuard`, `RolesGuard`, `@Roles()` custom decorator.
- Concepts: authentication vs authorization, Guard/`canActivate()`, custom decorators, Reflector, JWT payload.

## Phase 6 — Production Ready (stretch, fully optional)

Only if everything else is done with time to spare.

- Swagger/OpenAPI docs, Joi-based config validation, structured logging (pino), health checks (`@nestjs/terminus`), multi-stage production Dockerfile.

---

## Progress Tracker

- [x] Phase 0 — Bootstrap
- [x] Phase 1 — Core CRUD (In-Memory)
- [x] Phase 2 — Adapter Pattern
- [x] Phase 3 — Database & Migrations
- [ ] Phase 4 — Event Bus & Audit
- [ ] Phase 5 — Auth & Authorization (stretch)
- [ ] Phase 6 — Production Ready (stretch)