# Project 3 — Final Comprehensive Project (Applying Everything This Week)

Purpose: not a new project from scratch. Takes the existing `Parking-Ticket-API` (NestJS) and `parking-ticket-web` (Next.js) and connects them for real, adding a live Socket.io update, so it applies every concept from this week's required curriculum together: NestJS modularity/DI, Next.js App Router, the Adapter Pattern, Event-Driven architecture (EventEmitter2), and WebSockets/Socket.io.

This is a separate exercise from the real Toyota Walking Spine task in the internship — do not confuse the two. This is small, self-contained, and reuses code that already works.

Hard rule for the agent, same as before: do not add any library, service, or tool not listed here without asking first and getting an explicit yes.

---

## Part A — NestJS side (Parking-Ticket-API repo)

### A.1 — Enable CORS

In `main.ts`, allow the Next.js dev origin to call the API:
```typescript
app.enableCors({ origin: 'http://localhost:3001' });
```
Explain: without this, the browser blocks the frontend's requests to a different port by default (same-origin policy).

### A.2 — Add a WebSocket Gateway

New file `src/tickets/tickets.gateway.ts`:
```typescript
@WebSocketGateway({ cors: { origin: 'http://localhost:3001' } })
export class TicketsGateway {
  @WebSocketServer()
  server: Server;
}
```
Register it as a provider in `tickets.module.ts`.

### A.3 — Wire the existing event to the socket

New file `src/tickets/listeners/ticket-socket.listener.ts`:
```typescript
@Injectable()
export class TicketSocketListener {
  constructor(private readonly gateway: TicketsGateway) {}

  @OnEvent('ticket.created')
  handleTicketCreated(event: TicketCreatedEvent) {
    this.gateway.server.emit('ticket.created', event);
  }
}
```
Register as a provider. Explain: this is a second listener on the exact same `ticket.created` event that `AuditListener` already listens to from Phase 4 — proof that one event can have multiple independent consumers.

### A.4 — Verify manually

Run the server, connect a simple Socket.io client test (or just verify via the frontend in Part B once it's built) to confirm `ticket.created` events fire on the socket when `POST /tickets` succeeds.

Concepts applied: Event-driven architecture (reused), CORS, WebSocket Gateway (new), multiple listeners on one event.

---

## Part B — Next.js side (parking-ticket-web repo)

### B.1 — Replace mock data with a real fetch

In `app/page.tsx`, replace the `mockTickets` import with a real call to the NestJS API on initial load:
```typescript
useEffect(() => {
  fetch('http://localhost:3000/tickets')
    .then((res) => res.json())
    .then((data) => setTickets(data));
}, []);
```
Explain: this replaces Project 2's hardcoded array with real data from Project 1's API — this single change is what makes it a "connecting" project between the two.

### B.2 — Update the create-ticket flow to call the real API

Replace the local `setTickets([newTicket, ...tickets])` logic in `handleSubmit` with a real `POST` to the API, then let the socket (B.3) handle updating the UI instead of updating local state directly:
```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  await fetch('http://localhost:3000/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plate }),
  });
  setPlate('');
}
```

### B.3 — Add the Socket.io client

Install:
```bash
npm install socket.io-client
```
In `app/page.tsx`, connect once and listen for live updates:
```typescript
useEffect(() => {
  const socket = io('http://localhost:3000');
  socket.on('ticket.created', (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);
  });
  return () => { socket.disconnect(); };
}, []);
```
Explain: now when any ticket is created (from this browser tab or another), every connected browser sees it appear instantly — no page reload, no manual refetch, no polling.

### B.4 — Verify manually

Open the page in two browser tabs side by side. Create a ticket in one tab, confirm it appears instantly in the other tab without refreshing. This is the concrete proof that the socket + event-driven wiring actually works end to end.

Concepts applied: fetch to an external API (new), Socket.io client (new), real-time UI updates driven by server-pushed events (ties Sockets + Event-Driven + Next.js together).

---

## Git workflow

Same as before: one branch per side (`feat/connect-to-api` in web, `feat/socket-gateway` in api), Conventional Commits, PR with a clear "what changed / how verified" description, merge, update progress trackers in both repos' docs.

## Progress Tracker

- [ ] A.1 — CORS enabled on NestJS
- [ ] A.2 — TicketsGateway created
- [ ] A.3 — TicketSocketListener wired to existing `ticket.created` event
- [ ] B.1 — Next.js fetches real ticket list from the API
- [ ] B.2 — Next.js create form posts to the real API
- [ ] B.3 — Socket.io client connected, live updates working
- [ ] B.4 — Verified with two browser tabs side by side
