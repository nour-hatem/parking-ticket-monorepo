import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { Ticket } from './interfaces/ticket.interface.js';

@Injectable()
export class TicketsService {
  private readonly tickets: Ticket[] = [];

  create(dto: CreateTicketDto): Ticket {
    const ticket: Ticket = {
      id: randomUUID(),
      plate: dto.plate,
      status: 'waiting',
      createdAt: new Date(),
    };

    this.tickets.push(ticket);
    return ticket;
  }

  findAll(): Ticket[] {
    return this.tickets;
  }

  findOne(id: string): Ticket {
    const ticket = this.tickets.find((t) => t.id === id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }
    return ticket;
  }
}
