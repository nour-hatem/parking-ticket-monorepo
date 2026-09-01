import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import type { Ticket } from './interfaces/ticket.interface.js';
import { TicketsService } from './tickets.service.js';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async create(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    return await this.ticketsService.create(createTicketDto);
  }

  @Get()
  async findAll(): Promise<Ticket[]> {
    return await this.ticketsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Ticket> {
    return await this.ticketsService.findOne(id);
  }
}
