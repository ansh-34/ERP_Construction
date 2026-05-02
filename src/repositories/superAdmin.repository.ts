import prisma from '../infra/database/prisma/prisma.client.js';

export const SuperAdminRepository = {
  findActiveByEmail(email: string) {
    return prisma.superAdmin.findFirst({
      where: { email, isDeleted: false },
    });
  },
};
