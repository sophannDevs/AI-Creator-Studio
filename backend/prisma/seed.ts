import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run Prisma seed.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main(): Promise<void> {
  // Phase 2 seed plumbing only: intentionally no seed records.
  console.log('Prisma seed completed (no-op).');
}

void main()
  .catch((error) => {
    console.error('Prisma seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
