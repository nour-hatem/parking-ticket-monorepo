import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketsController } from './tickets.controller.js';

const mockTicketsService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
};

describe('TicketsController', () => {
  let controller: TicketsController;

  const sampleTicket = {
    id: 'ticket-uuid-1',
    plate: 'EGY-1001',
    status: 'waiting' as const,
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new TicketsController(mockTicketsService as any);
  });

  describe('POST /tickets — create()', () => {
    it('should call service.create() with the correct DTO and return the ticket', async () => {
      mockTicketsService.create.mockResolvedValue(sampleTicket);

      const result = await controller.create({ plate: 'EGY-1001' });

      expect(mockTicketsService.create).toHaveBeenCalledWith({ plate: 'EGY-1001' });
      expect(result).toEqual(sampleTicket);
    });

    it('should propagate exceptions thrown by the service', async () => {
      mockTicketsService.create.mockRejectedValue(new Error('Plate blacklisted'));

      await expect(controller.create({ plate: 'XYZ-9999' })).rejects.toThrow('Plate blacklisted');
    });
  });

  describe('GET /tickets — findAll()', () => {
    it('should return all tickets from service', async () => {
      const tickets = [sampleTicket, { ...sampleTicket, id: 'ticket-uuid-2' }];
      mockTicketsService.findAll.mockResolvedValue(tickets);

      const result = await controller.findAll();

      expect(mockTicketsService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
    });

    it('should return an empty array when no tickets exist', async () => {
      mockTicketsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('GET /tickets/:id — findOne()', () => {
    it('should return the correct ticket by id', async () => {
      mockTicketsService.findOne.mockResolvedValue(sampleTicket);

      const result = await controller.findOne('ticket-uuid-1');

      expect(mockTicketsService.findOne).toHaveBeenCalledWith('ticket-uuid-1');
      expect(result.id).toBe('ticket-uuid-1');
    });

    it('should propagate NotFoundException from service', async () => {
      const { NotFoundException } = await import('@nestjs/common');
      mockTicketsService.findOne.mockRejectedValue(new NotFoundException('Not found'));

      await expect(controller.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
