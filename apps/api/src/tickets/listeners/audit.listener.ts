import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TicketCreatedEvent } from '../events/ticket-created.event.js';

@Injectable()
export class AuditListener {
  private readonly logger = new Logger(AuditListener.name);

  @OnEvent('ticket.created')
  handleTicketCreatedEvent(event: TicketCreatedEvent): void {
    const { ticket } = event;
    this.logger.log(
      `[AUDIT LOG] Ticket Issued -> ID: ${ticket.id} | Plate: ${ticket.plate} | Status: ${ticket.status} | CreatedAt: ${ticket.createdAt}`,
    );
  }
}
