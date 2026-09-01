# Parking Ticket Web — Project Plan (Next.js only)

Purpose: learn and apply core Next.js App Router concepts through a small standalone frontend. This project does not call any real backend yet — it uses local mock data only. No connection to the NestJS API happens here; that is a separate project (Project 3).

Hard rule for the agent: do not install, suggest, or wire in any library, service, cloud account, database, auth provider, or tool that is not explicitly listed in this plan. If something seems useful, ask first and wait for an explicit yes before doing it. Do not expand scope on your own initiative, even if it would make the project "more complete" or "more production-ready."

Time budget: this is meant to take a few hours, not a full day. Keep it small.

---

## Repository

New, separate repo: `parking-ticket-web`. Not connected to the `Parking-Ticket-API` repo. Standard Next.js `.gitignore` (`node_modules`, `.next`, `.env*`).

## Scaffold

```bash
npx create-next-app@latest parking-ticket-web
```
When prompted: TypeScript = yes, App Router = yes, Tailwind = optional (agent's call, keep it simple either way), src directory = agent's call, import alias = default.

Explain what the CLI generated before touching anything, the same way Phase 0 of the NestJS project was explained.

---

## Phase 1 — Static page with mock data (MUST)

Goal: one page that renders a list of tickets from a local, hardcoded array. No API calls, no backend, no database.

1. Create a mock data file:
```typescript
// app/lib/mock-tickets.ts
export interface Ticket {
  id: string;
  plate: string;
  status: 'waiting' | 'paid' | 'cancelled';
  createdAt: string;
}

export const mockTickets: Ticket[] = [
  { id: '1', plate: 'ABC-1234', status: 'waiting', createdAt: '2026-09-01T10:00:00Z' },
  { id: '2', plate: 'XYZ-9999', status: 'paid', createdAt: '2026-09-01T09:30:00Z' },
];
```

2. Build the page (App Router, server component by default — no `"use client"` needed here since there's no interactivity yet):
```typescript
// app/page.tsx
import { mockTickets } from './lib/mock-tickets';

export default function HomePage() {
  return (
    <main>
      <h1>Parking Tickets</h1>
      <ul>
        {mockTickets.map((ticket) => (
          <li key={ticket.id}>
            {ticket.plate} — {ticket.status}
          </li>
        ))}
      </ul>
    </main>
  );
}
```

3. Run it:
```bash
npm run dev
```
Open `http://localhost:3001` (or whatever port it picks) and confirm the list renders.

Concepts to explain: App Router file-based routing (`app/page.tsx` = the `/` route), server components by default, why no `"use client"` is needed yet.

## Phase 2 — Make it interactive (MUST)

Goal: add a form to create a new ticket, held in client-side state only (nothing persisted, nothing sent anywhere).

1. Convert the page to a client component (or split into a client child component — agent should explain which approach and why):
```typescript
'use client';
import { useState } from 'react';
import { mockTickets, type Ticket } from './lib/mock-tickets';

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [plate, setPlate] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      plate,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };
    setTickets([newTicket, ...tickets]);
    setPlate('');
  }

  return (
    <main>
      <h1>Parking Tickets</h1>
      <form onSubmit={handleSubmit}>
        <input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="ABC-1234" />
        <button type="submit">Create Ticket</button>
      </form>
      <ul>
        {tickets.map((ticket) => (
          <li key={ticket.id}>{ticket.plate} — {ticket.status}</li>
        ))}
      </ul>
    </main>
  );
}
```

2. Understanding check: explain out loud (to yourself or the agent) why `"use client"` had to be added here but not in Phase 1 — the answer should mention `useState` and event handlers only running in the browser.

Concepts to explain: `"use client"` directive and why it's needed, `useState`, controlled form inputs, why a client component still runs on the server for the first render (hydration, at a high level — no need to go deep).

## Phase 3 — Basic navigation (MUST, small)

Goal: prove you understand App Router's file-based routing beyond a single page.

1. Add a second route:
```
app/about/page.tsx
```
```typescript
export default function AboutPage() {
  return <p>Parking Ticket Web — Project 2 (Next.js only), Tamkeen Week 1.</p>;
}
```

2. Add a link between the two pages using Next.js's `Link` component (not a plain `<a>` tag):
```typescript
import Link from 'next/link';
// inside HomePage's JSX:
<Link href="/about">About</Link>
```

Concepts to explain: file-based routing convention (`app/about/page.tsx` → `/about`), why `next/link` is used instead of `<a href>` (client-side navigation, no full page reload).

---

## Explicitly out of scope for this project (do not add)

- Any real backend call (`fetch` to the NestJS API) — that is Project 3.
- Any database, ORM, or persistence.
- Any authentication.
- Tailwind component libraries, UI kits, or design systems beyond what the scaffold generates.
- Any deployment (Vercel, etc.) unless explicitly requested later.

## Progress Tracker

- [x] Scaffold created
- [x] Phase 1 — Static page with mock data
- [x] Phase 2 — Interactive form with client-side state
- [x] Phase 3 — Basic navigation between two routes
