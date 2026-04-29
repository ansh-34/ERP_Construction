import prisma from '../infra/database/prisma/prisma.client.js';

export const SuperadminRepository = {
  findActiveByEmail(email: string) {
    return prisma.superadmin.findFirst({
      where: { email, isDeleted: false },
    });
  },
};
