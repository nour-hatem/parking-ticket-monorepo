import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketSocketListener } from './ticket-socket.listener.js';
import { TicketCreatedEvent } from '../events/ticket-created.event.js';

const mockGateway = {
  server: {
    emit: vi.fn(),
  },
};

describe('TicketSocketListener', () => {
  let listener: TicketSocketListener;

  const sampleTicket = {
    id: 'ticket-uuid-1',
    plate: 'EGY-1001',
    status: 'waiting' as const,
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    listener = new TicketSocketListener(mockGateway as any);
  });

  it('should emit the ticket.created event over the WebSocket server', () => {
    const event = new TicketCreatedEvent(sampleTicket);

    listener.handleTicketCreated(event);

    expect(mockGateway.server.emit).toHaveBeenCalledWith('ticket.created', sampleTicket);
  });

  it('should not throw if gateway.server is null/undefined', () => {
    const listenerNoServer = new TicketSocketListener({ server: null } as any);
    const event = new TicketCreatedEvent(sampleTicket);

    expect(() => listenerNoServer.handleTicketCreated(event)).not.toThrow();
  });
});
