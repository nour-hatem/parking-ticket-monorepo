export interface Ticket {
  id: string;
  plate: string;
  status: 'waiting' | 'paid' | 'cancelled';
  createdAt: string;
}

export const mockTickets: Ticket[] = [
  { id: '1', plate: 'ABC-1234', status: 'waiting', createdAt: '2026-09-01T10:00:00Z' },
  { id: '2', plate: 'XYZ-9999', status: 'paid', createdAt: '2026-09-01T09:30:00Z' },
];
