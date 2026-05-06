import 'dotenv/config';
import { PrismaClient } from './generated/prisma/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { variables } from '../../../config';

const adapter = new PrismaPg({
  connectionString: variables.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
