import React from 'react';
import type { Ticket } from '@parking-system/shared';

interface TicketCardProps {
  ticket: Ticket;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const formattedDate = new Date(ticket.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'waiting':
        return 'status-waiting';
      case 'paid':
        return 'status-paid';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="ticket-card">
      <div className="ticket-header">
        <span className="plate-number">{ticket.plate}</span>
        <span className={`status-badge ${getStatusColor(ticket.status)}`}>
          {ticket.status}
        </span>
      </div>
      <div className="ticket-footer">
        <span className="ticket-id">ID: {ticket.id.slice(0, 8)}...</span>
        <span className="ticket-time">{formattedDate}</span>
      </div>
    </div>
  );
};
