'use client';
import { useState } from 'react';
import Link from 'next/link';
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
    <main className="container">
      <h1>Parking Tickets</h1>
      <Link href="/about" className="nav-link">About</Link>
      <form onSubmit={handleSubmit} className="ticket-form">
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          placeholder="ABC-1234"
        />
        <button type="submit">Create Ticket</button>
      </form>
      <ul className="ticket-list">
        {tickets.map((ticket) => (
          <li key={ticket.id} className="ticket-item">
            {ticket.plate} — {ticket.status}
          </li>
        ))}
      </ul>
    </main>
  );
}

