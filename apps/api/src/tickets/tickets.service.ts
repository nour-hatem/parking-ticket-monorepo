import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import type { Ticket } from './interfaces/ticket.interface.js';
import { type IPlateLookupPort, PLATE_LOOKUP_PORT } from './ports/plate-lookup.port.js';

@Injectable()
export class TicketsService {
  private readonly tickets: Ticket[] = [];

  constructor(
    @Inject(PLATE_LOOKUP_PORT)
    private readonly plateLookup: IPlateLookupPort,
  ) {}

  create(dto: CreateTicketDto): Ticket {
    const carInfo = this.plateLookup.lookup(dto.plate);
    if (carInfo?.isBlacklisted) {
      throw new ForbiddenException(
        `Plate "${dto.plate}" is blacklisted. Ticket issuance denied.`,
      );
    }

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
