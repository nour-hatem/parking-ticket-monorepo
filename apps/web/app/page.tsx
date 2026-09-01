'use client';
import { useState } from 'react';
import { mockTickets, type Ticket } from './lib/mock-tickets';

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);

  return (
    <main>
      <h1>Parking Tickets</h1>
      <ul>
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            {ticket.plate} — {ticket.status}
          </li>
        ))}
      </ul>
    </main>
  );
}
