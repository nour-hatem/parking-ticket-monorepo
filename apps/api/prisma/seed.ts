import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@parking.com' },
    update: {},
    create: {
      email: 'admin@parking.com',
      password: hashedPassword,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: 'officer@parking.com' },
    update: {},
    create: {
      email: 'officer@parking.com',
      password: hashedPassword,
      name: 'Parking Officer',
      role: 'OPERATOR',
    },
  });

  const ticket1 = await prisma.ticket.create({
    data: {
      plate: 'EGY-1001',
      status: 'waiting',
      userId: admin.id,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      plate: 'EGY-2002',
      status: 'paid',
      userId: operator.id,
    },
  });

  console.log('✅ Seeding completed successfully.');
  console.log({ admin: admin.email, operator: operator.email, tickets: [ticket1.plate, ticket2.plate] });
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
