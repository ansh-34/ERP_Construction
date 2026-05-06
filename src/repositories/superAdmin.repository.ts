import prisma from '../infra/database/prisma/prisma.client.js';

export const SuperAdminRepository = {
  findActiveById(id: string) {
    return prisma.superAdmin.findFirst({
      where: { id, isDeleted: false },
    });
  },

  findActiveByEmail(email: string) {
    return prisma.superAdmin.findFirst({
      where: { email, isDeleted: false },
    });
  },

  findByEmail(email: string) {
    return prisma.superAdmin.findFirst({
      where: { email, isDeleted: false },
    });
  },
};
