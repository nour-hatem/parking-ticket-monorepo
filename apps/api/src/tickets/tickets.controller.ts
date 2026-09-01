import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import type { Ticket } from './interfaces/ticket.interface.js';
import { TicketsService } from './tickets.service.js';


@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto): Ticket {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  findAll(): Ticket[] {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Ticket {
    return this.ticketsService.findOne(id);
  }
}
