export interface CarInfo {
  ownerName: string;
  carModel: string;
  isBlacklisted: boolean;
}

export interface IPlateLookupPort {
  lookup(plate: string): CarInfo | null;
}

export const PLATE_LOOKUP_PORT = Symbol('PLATE_LOOKUP_PORT');
