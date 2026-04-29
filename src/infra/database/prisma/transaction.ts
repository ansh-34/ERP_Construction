import prisma from './prisma.client.js';

type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

export const withTransaction = async <T>(
  callback: (tx: TransactionClient) => Promise<T>,
) => {
  return prisma.$transaction(callback);
};
