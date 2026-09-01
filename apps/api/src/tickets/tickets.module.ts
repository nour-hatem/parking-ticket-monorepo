import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FakePlateLookupAdapter } from './adapters/fake-plate-lookup.adapter.js';
import { PLATE_LOOKUP_PORT } from './ports/plate-lookup.port.js';
import { TicketEntity } from './ticket.entity.js';
import { TicketsController } from './tickets.controller.js';
import { TicketsService } from './tickets.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([TicketEntity])],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    {
      provide: PLATE_LOOKUP_PORT,
      useClass: FakePlateLookupAdapter,
    },
  ],
  exports: [TicketsService],
})
export class TicketsModule {}
