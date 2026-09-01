import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
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
  ) {}

  async create(dto: CreateTicketDto): Promise<Ticket> {
    const carInfo = this.plateLookup.lookup(dto.plate);
    if (carInfo?.isBlacklisted) {
      throw new ForbiddenException(
        `Plate "${dto.plate}" is blacklisted. Ticket issuance denied.`,
      );
    }

    const ticket = this.ticketsRepository.create({
      plate: dto.plate,
      status: 'waiting',
    });

    return await this.ticketsRepository.save(ticket);
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
