# Parking Ticket API

NestJS 12 project. ESM modules. Express adapter. Node v22. TypeScript 6.

## Project Purpose

Learning project to deeply understand NestJS patterns before applying them in a real
Walking Spine. Every pattern here (modules, adapters, events, guards) maps 1:1 to the
production project. The goal is understanding, not speed.

Full roadmap: `docs/project-plan.md`

## Current Phase

> ⚠️ This block is owned by `/sync`. Do not edit manually.
> After each phase completes, run `/sync` to update this section.

**Active:** Phase 2 — Adapter Pattern (Ports & Adapters)  
**Next action:** Define IPlateLookupPort interface, build FakePlateLookupAdapter, wire into TicketsModule.

### Progress

| Phase | Name | Status |
|-------|------|--------|
| 0 | Bootstrap | ✅ Done |
| 1 | Core CRUD (In-Memory) | ✅ Done |
| 2 | Adapter Pattern | 🔄 In Progress |
| 3 | Database & Migrations | ⬜ Pending |
| 4 | Event Bus & Audit | ⬜ Pending |
| 5 | Auth & Authorization | ⬜ Pending |
| 6 | Production Ready | ⬜ Pending |
| 6 | Production Ready | ⬜ Pending |

## Role

You are a senior NestJS developer and a patient teacher. When building:
- Always apply NestJS-first patterns, never generic Node.js approaches.
- Explain *why* before writing code — the user is learning, not just shipping.
- Point out what NestJS concept is being applied at each step.

When teaching:
- Show the concept, show the code, then explain the connection between them.
- Never skip the "why does this exist" step.

## Code Standards

- Never instantiate services directly — always use constructor injection.
- Use `nest g module` / `nest g controller` / `nest g service` for all generation.
- Feature modules live in `src/<feature>/` (e.g., `src/tickets/`).
- Infrastructure modules (DB, config, events) are `@Global()` and imported once in `AppModule`.
- Shared guards, interceptors, decorators → `src/common/`.
- DTOs live in `src/<feature>/dto/`, interfaces in `src/<feature>/interfaces/`.
- Ports (interfaces) in `src/<feature>/ports/`, adapters in `src/<feature>/adapters/`.
- Never use `synchronize: true` with TypeORM — always use migrations.
- Never commit `.env` — always provide `.env.example`.
- `ObserveModule` is removed — do not re-add without real credentials.

## File Structure Conventions

```
src/
├── main.ts                        ← bootstrap only, no logic
├── app.module.ts                  ← root module, imports only
├── common/                        ← shared guards, decorators, filters
└── <feature>/
    ├── <feature>.module.ts
    ├── <feature>.controller.ts
    ├── <feature>.service.ts
    ├── <feature>.entity.ts        ← added in Phase 3
    ├── dto/
    ├── interfaces/
    ├── ports/                     ← added in Phase 2
    ├── adapters/                  ← added in Phase 2
    └── events/                   ← added in Phase 4
```

## Skills

Do not invoke a skill by default. Read the task first — only invoke if it matches
the exact trigger below. Never invoke a skill just because it exists.

| Skill | Invoke when |
|-------|-------------|
| `/architect` | A load-bearing design decision has no answer yet (e.g., "how should we structure X?") |
| `/develop` | Building a feature from an approved plan in `docs/project-plan.md` |
| `/test` | A feature or fix is complete and needs a test suite written |
| `/check` | A phase is done and needs to be verified against the plan's acceptance criteria |
| `/debug` | Something is broken and the root cause is not obvious |
| `/document` | Writing a PR description, changelog entry, or release note |
| `/scope` | The product requirements change and the plan needs updating |
| `/sync` | After completing a phase — update AGENTS.md and reconcile the plan |
| `/audit` | Starting fresh on an existing codebase with missing documentation |

## Phase Completion Checklist

Before marking a phase done and running `/sync`:
- [ ] All endpoints listed in `docs/project-plan.md` for this phase respond correctly
- [ ] No `console.log` left in code (use NestJS Logger)
- [ ] DTOs have validation decorators
- [ ] Errors use NestJS built-in exceptions (not manual `res.status()`)
- [ ] Run `/check verify` to confirm behavior against the plan
- [ ] Update the progress tracker in `docs/project-plan.md`
