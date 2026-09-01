import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { TicketCreatedEvent } from './events/ticket-created.event.js';
import type { Ticket } from './interfaces/ticket.interface.js';
import { type IPlateLookupPort, PLATE_LOOKUP_PORT } from './ports/plate-lookup.port.js';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PLATE_LOOKUP_PORT)
    private readonly plateLookup: IPlateLookupPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateTicketDto): Promise<Ticket> {
    const carInfo = this.plateLookup.lookup(dto.plate);
    if (carInfo?.isBlacklisted) {
      throw new ForbiddenException(
        `Plate "${dto.plate}" is blacklisted. Ticket issuance denied.`,
      );
    }

    const savedTicket = await this.prisma.ticket.create({
      data: {
        plate: dto.plate,
        status: 'waiting',
      },
    });

    // Emit event after ticket is persisted in Prisma
    this.eventEmitter.emit('ticket.created', new TicketCreatedEvent(savedTicket as Ticket));

    return savedTicket as Ticket;
  }

  async findAll(): Promise<Ticket[]> {
    const tickets = await this.prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return tickets as Ticket[];
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }
    return ticket as Ticket;
  }
}
