import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import type { Ticket } from './interfaces/ticket.interface.js';
import { TicketsService } from './tickets.service.js';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Post()
  @ApiOperation({ summary: 'Create a new parking ticket (ADMIN or OPERATOR only)' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource for user role.' })
  async create(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    return this.ticketsService.create(createTicketDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all parking tickets' })
  @ApiResponse({ status: 200, description: 'Returns list of tickets.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(): Promise<Ticket[]> {
    return this.ticketsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific ticket by ID' })
  @ApiResponse({ status: 200, description: 'Returns ticket details.' })
  @ApiResponse({ status: 404, description: 'Ticket not found.' })
  async findOne(@Param('id') id: string): Promise<Ticket> {
    return this.ticketsService.findOne(id);
  }
}
