import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { TicketEntity } from '../tickets/ticket.entity.js';
import { CreateTicketsTable1700000000000 } from './migrations/1700000000000-CreateTicketsTable.js';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5433),
  username: process.env.DATABASE_USER ?? 'parking',
  password: process.env.DATABASE_PASSWORD ?? 'parking123',
  database: process.env.DATABASE_NAME ?? 'parking_db',
  entities: [TicketEntity],
  migrations: [CreateTicketsTable1700000000000],
  synchronize: false,
});
