import type { Role } from '../../../generated/prisma/index.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
