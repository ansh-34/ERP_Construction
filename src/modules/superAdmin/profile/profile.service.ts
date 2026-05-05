import jwt from 'jsonwebtoken';
import prisma from '../../../infra/database/prisma/prisma.client.js';

const superAdminSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
};

export const SuperAdminProfileService = {
  async getProfile(token: string) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };

    const superAdmin = await prisma.superAdmin.findFirst({
      where: {
        id: decoded.id,
        email: decoded.email,
        isDeleted: false,
      },
      select: superAdminSelect,
    });

    if (!superAdmin) {
      throw new Error('SuperAdmin profile not found');
    }

    return {
      user: {
        id: superAdmin.id,
        name: 'Superadmin',
        email: superAdmin.email,
        role: 'SUPERADMIN',
      },
    };
  },
};
