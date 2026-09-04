'use client';

import { useEffect, useState } from 'react';
import type { Ticket } from '@parking-system/shared';
import { fetchTickets } from '../lib/api';
import { getSocket } from '../lib/socket';
import { TicketForm } from '../components/ticket-form';
import { TicketList } from '../components/ticket-list';

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  // B.1 — Fetch initial tickets list from NestJS API on load
  useEffect(() => {
    fetchTickets()
      .then((data) => {
        setTickets(data);
      })
      .catch((err) => {
        console.error('Failed to fetch initial tickets:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // B.3 — Socket.io live listener
  useEffect(() => {
    const socket = getSocket();

    function onConnect() {
      setConnected(true);
    }

    function onDisconnect() {
      setConnected(false);
    }

    function onTicketCreated(newTicket: Ticket) {
      setTickets((prev) => {
        // Avoid duplicate items if socket fires repeatedly
        if (prev.some((t) => t.id === newTicket.id)) return prev;
        return [newTicket, ...prev];
      });
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('ticket.created', onTicketCreated);

    if (socket.connected) {
      setConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('ticket.created', onTicketCreated);
    };
  }, []);

  return (
    <main className="container">
      <header className="app-header">
        <div>
          <h1 className="app-title">Parking Ticket System</h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Real-Time Live Feed Monorepo
          </p>
        </div>
        <div className="connection-status">
          <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
          {connected ? 'Live Socket Connected' : 'Connecting Socket...'}
        </div>
      </header>

      <TicketForm />

      <section>
        <h2 className="section-title">Issued Tickets ({tickets.length})</h2>
        <TicketList tickets={tickets} loading={loading} />
      </section>
    </main>
  );
}
