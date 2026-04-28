import { prisma } from '@infra/database/prisma/prisma.client';

export const withTransaction = async (callback) => {
  return prisma.$transaction(async (tx) => {
    return callback(tx);
  });
};
