import { Module } from '@nestjs/common';
import { FakePlateLookupAdapter } from './adapters/fake-plate-lookup.adapter.js';
import { PLATE_LOOKUP_PORT } from './ports/plate-lookup.port.js';
import { TicketsController } from './tickets.controller.js';
import { TicketsService } from './tickets.service.js';

@Module({
  controllers: [TicketsController],
  providers: [
    TicketsService,
    {
      provide: PLATE_LOOKUP_PORT,
      useClass: FakePlateLookupAdapter,
    },
  ],
})
export class TicketsModule {}
