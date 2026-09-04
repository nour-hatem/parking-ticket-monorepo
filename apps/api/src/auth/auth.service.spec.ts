import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';

// ──────────────────────────────────────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────────────────────────────────────

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}));

import bcrypt from 'bcrypt';

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

const mockJwtService = {
  signAsync: vi.fn().mockResolvedValue('jwt.token.here'),
};

const mockConfigService = {
  get: vi.fn(),
};

// ──────────────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  const sampleUser = {
    id: 'user-uuid-1',
    email: 'nour@test.com',
    password: 'hashed_password',
    name: 'Nour Hatem',
    role: 'USER',
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(
      mockPrisma as any,
      mockJwtService as any,
      mockConfigService as any,
    );
  });

  // ── register ──────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('should register a new user and return user + access_token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(sampleUser);

      const result = await service.register({
        email: 'nour@test.com',
        password: 'StrongPass123!',
        name: 'Nour Hatem',
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nour@test.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('StrongPass123!', 10);
      expect(result).toHaveProperty('access_token', 'jwt.token.here');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should assign the USER role by default when no role is provided', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(sampleUser);

      await service.register({
        email: 'nour@test.com',
        password: 'pass',
        name: 'Nour',
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ role: 'USER' }),
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(sampleUser);

      await expect(
        service.register({ email: 'nour@test.com', password: 'pass', name: 'Nour' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should never store the raw password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(sampleUser);

      await service.register({ email: 'nour@test.com', password: 'RawPassword!', name: 'Nour' });

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.password).not.toBe('RawPassword!');
      expect(createCall.data.password).toBe('hashed_password');
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('should return user + access_token for valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(sampleUser);
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await service.login({
        email: 'nour@test.com',
        password: 'StrongPass123!',
      });

      expect(result).toHaveProperty('access_token', 'jwt.token.here');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException when user email is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@test.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(sampleUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        service.login({ email: 'nour@test.com', password: 'WrongPassword!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should not expose the hashed password in the response', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(sampleUser);
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await service.login({ email: 'nour@test.com', password: 'pass' });

      expect(result.user).not.toHaveProperty('password');
    });

    it('should call jwtService.signAsync with the correct payload', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(sampleUser);
      (bcrypt.compare as any).mockResolvedValue(true);

      await service.login({ email: 'nour@test.com', password: 'pass' });

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: sampleUser.id,
        email: sampleUser.email,
        role: sampleUser.role,
      });
    });
  });
});
