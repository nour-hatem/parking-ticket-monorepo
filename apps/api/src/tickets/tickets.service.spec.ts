import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';

// ──────────────────────────────────────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────────────────────────────────────

const mockPrisma = {
  ticket: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
};

const mockPlateLookup = {
  lookup: vi.fn(),
};

const mockEventEmitter = {
  emit: vi.fn(),
};

// ──────────────────────────────────────────────────────────────────────────────

describe('TicketsService', () => {
  let service: TicketsService;

  const sampleTicket = {
    id: 'ticket-uuid-1',
    plate: 'EGY-1001',
    status: 'waiting' as const,
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TicketsService(
      mockPrisma as any,
      mockPlateLookup as any,
      mockEventEmitter as any,
    );
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('should create a ticket for a clean (non-blacklisted) plate', async () => {
      mockPlateLookup.lookup.mockReturnValue({ ownerName: 'Nour', isBlacklisted: false });
      mockPrisma.ticket.create.mockResolvedValue(sampleTicket);

      const result = await service.create({ plate: 'EGY-1001' });

      expect(mockPlateLookup.lookup).toHaveBeenCalledWith('EGY-1001');
      expect(mockPrisma.ticket.create).toHaveBeenCalledWith({
        data: { plate: 'EGY-1001', status: 'waiting' },
      });
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'ticket.created',
        expect.objectContaining({ ticket: sampleTicket }),
      );
      expect(result).toEqual(sampleTicket);
    });

    it('should create a ticket for an unknown plate (not in lookup DB)', async () => {
      mockPlateLookup.lookup.mockReturnValue(null);
      mockPrisma.ticket.create.mockResolvedValue(sampleTicket);

      const result = await service.create({ plate: 'NEW-0001' });

      expect(result).toEqual(sampleTicket);
      expect(mockPrisma.ticket.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ForbiddenException for a blacklisted plate', async () => {
      mockPlateLookup.lookup.mockReturnValue({ ownerName: 'Unknown', isBlacklisted: true });

      await expect(service.create({ plate: 'XYZ-9999' })).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.ticket.create).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should emit the ticket.created event after a successful save', async () => {
      mockPlateLookup.lookup.mockReturnValue(null);
      mockPrisma.ticket.create.mockResolvedValue(sampleTicket);

      await service.create({ plate: 'EGY-1001' });

      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'ticket.created',
        expect.anything(),
      );
    });

    it('should propagate Prisma errors upward', async () => {
      mockPlateLookup.lookup.mockReturnValue(null);
      mockPrisma.ticket.create.mockRejectedValue(new Error('DB connection lost'));

      await expect(service.create({ plate: 'EGY-1001' })).rejects.toThrow('DB connection lost');
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('should return all tickets ordered by createdAt desc', async () => {
      const tickets = [sampleTicket, { ...sampleTicket, id: 'ticket-uuid-2' }];
      mockPrisma.ticket.findMany.mockResolvedValue(tickets);

      const result = await service.findAll();

      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('ticket-uuid-1');
    });

    it('should return an empty array when no tickets exist', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return the ticket matching the given id', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(sampleTicket);

      const result = await service.findOne('ticket-uuid-1');

      expect(mockPrisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: 'ticket-uuid-1' },
      });
      expect(result.id).toBe('ticket-uuid-1');
    });

    it('should throw NotFoundException when the ticket does not exist', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException with the correct message', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        'Ticket with ID "bad-id" not found',
      );
    });
  });
});
