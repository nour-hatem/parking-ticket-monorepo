import React from 'react';
import type { Ticket } from '@parking-system/shared';
import { TicketCard } from './ticket-card';

interface TicketListProps {
  tickets: Ticket[];
  loading?: boolean;
}

export const TicketList: React.FC<TicketListProps> = ({ tickets, loading }) => {
  if (loading) {
    return <div className="loading-spinner">Loading active tickets...</div>;
  }

  if (tickets.length === 0) {
    return <div className="empty-state">No tickets issued yet. Use the form above to issue one.</div>;
  }

  return (
    <div className="ticket-grid">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
