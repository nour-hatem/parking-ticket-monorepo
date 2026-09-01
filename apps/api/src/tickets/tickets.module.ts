import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { FakePlateLookupAdapter } from './adapters/fake-plate-lookup.adapter.js';
import { AuditListener } from './listeners/audit.listener.js';
import { PLATE_LOOKUP_PORT } from './ports/plate-lookup.port.js';
import { TicketsController } from './tickets.controller.js';
import { TicketsService } from './tickets.service.js';

@Module({
  imports: [AuthModule],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    AuditListener,
    { provide: PLATE_LOOKUP_PORT, useClass: FakePlateLookupAdapter },
  ],
})
export class TicketsModule {}
