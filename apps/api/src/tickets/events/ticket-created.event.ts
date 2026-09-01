import type { Ticket } from '../interfaces/ticket.interface.js';

export class TicketCreatedEvent {
  constructor(public readonly ticket: Ticket) {}
}
