import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import type { Ticket } from './interfaces/ticket.interface.js';
import { TicketsService } from './tickets.service.js';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Post()
  async create(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    return this.ticketsService.create(createTicketDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<Ticket[]> {
    return this.ticketsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Ticket> {
    return this.ticketsService.findOne(id);
  }
}
