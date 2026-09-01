import { Injectable } from '@nestjs/common';
import type { CarInfo, IPlateLookupPort } from '../ports/plate-lookup.port.js';

@Injectable()
export class FakePlateLookupAdapter implements IPlateLookupPort {
  private readonly fakeDatabase: Record<string, CarInfo> = {
    'ABC-1234': {
      ownerName: 'Ahmed Ali',
      carModel: 'Toyota Corolla',
      isBlacklisted: false,
    },
    'XYZ-9999': {
      ownerName: 'Unknown',
      carModel: 'Black SUV',
      isBlacklisted: true,
    },
  };

  lookup(plate: string): CarInfo | null {
    return this.fakeDatabase[plate] ?? null;
  }
}
