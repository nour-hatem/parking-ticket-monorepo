import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import type { Ticket } from './interfaces/ticket.interface.js';
import { TicketsService } from './tickets.service.js';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new parking ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input format.' })
  @ApiResponse({ status: 403, description: 'Plate is blacklisted.' })
  async create(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all parking tickets' })
  @ApiResponse({ status: 200, description: 'Returns list of tickets.' })
  async findAll(): Promise<Ticket[]> {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific ticket by ID' })
  @ApiResponse({ status: 200, description: 'Returns ticket details.' })
  @ApiResponse({ status: 404, description: 'Ticket not found.' })
  async findOne(@Param('id') id: string): Promise<Ticket> {
    return this.ticketsService.findOne(id);
  }
}
