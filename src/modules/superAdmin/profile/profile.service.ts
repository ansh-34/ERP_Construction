import prisma from '../../../infra/database/prisma/prisma.client.js';

export const SuperAdminProfileService = {
  async getProfile(userInfo: { userId: string }) {
    const superAdmin = await prisma.superAdmin.findFirst({
      where: { id: userInfo.userId, isDeleted: false },
      select: {
        id: true,
        email: true,
      },
    });
    return {
      user: {
        id: superAdmin?.id,
        name: 'Superadmin',
        email: superAdmin?.email,
        role: 'SUPERADMIN',
      },
    };
  },
};
