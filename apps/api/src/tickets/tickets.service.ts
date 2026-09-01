import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { TicketCreatedEvent } from './events/ticket-created.event.js';
import type { Ticket } from './interfaces/ticket.interface.js';
import { type IPlateLookupPort, PLATE_LOOKUP_PORT } from './ports/plate-lookup.port.js';
import { TicketEntity } from './ticket.entity.js';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketsRepository: Repository<TicketEntity>,
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

    const ticketEntity = this.ticketsRepository.create({
      plate: dto.plate,
      status: 'waiting',
    });

    const savedTicket = await this.ticketsRepository.save(ticketEntity);

    // Emit event after ticket is persisted
    this.eventEmitter.emit('ticket.created', new TicketCreatedEvent(savedTicket));

    return savedTicket;
  }

  async findAll(): Promise<Ticket[]> {
    return await this.ticketsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ id });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }
    return ticket;
  }
}
