import { PrismaClient } from '@infra/database/prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { variables } from '@/config/index';

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: variables.DATABASE_URL,
  });

if (variables.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['error'],
  });

if (variables.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const initDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('[DATABASE]: Prisma connected to database');
  } catch (error) {
    console.error('[DATABASE]: Prisma failed to connect:', error);
  }
};

export default prisma;
