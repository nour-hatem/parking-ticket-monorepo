import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { TicketStatus } from './interfaces/ticket.interface.js';

@Entity('tickets')
export class TicketEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  plate: string;

  @Column({ type: 'varchar', length: 20, default: 'waiting' })
  status: TicketStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
