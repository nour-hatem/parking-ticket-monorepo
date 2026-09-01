import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketsTable1700000000000 implements MigrationInterface {
  name = 'CreateTicketsTable1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tickets" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "plate" character varying(20) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'waiting',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tickets_id" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "tickets";
    `);
  }
}
