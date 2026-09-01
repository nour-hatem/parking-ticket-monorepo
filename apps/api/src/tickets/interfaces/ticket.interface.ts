export type TicketStatus = 'waiting' | 'paid' | 'cancelled';

export interface Ticket {
  id: string;
  plate: string;
  status: TicketStatus;
  createdAt: Date;
}
