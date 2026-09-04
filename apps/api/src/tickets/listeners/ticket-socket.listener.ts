import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TicketCreatedEvent } from '../events/ticket-created.event.js';
import { TicketsGateway } from '../tickets.gateway.js';

@Injectable()
export class TicketSocketListener {
  private readonly logger = new Logger(TicketSocketListener.name);

  constructor(private readonly gateway: TicketsGateway) {}

  @OnEvent('ticket.created')
  handleTicketCreated(event: TicketCreatedEvent) {
    this.logger.log(`[SOCKET BROADCAST] Emitting ticket.created -> ID: ${event.ticket.id}`);
    if (this.gateway.server) {
      this.gateway.server.emit('ticket.created', event.ticket);
    }
  }
}
