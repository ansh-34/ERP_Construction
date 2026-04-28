import prisma from '@/infra/database/prisma/prisma.client';
import { hashPassword } from '@/utils/bcrypt';
import { variables } from '@/config';

export const superAdminData = async () => {
  try {
    const role = await prisma.role.findFirst({
      where: {
        code: 'SUPER_ADMIN',
      },
    });

    if (role) {
      const existing = await prisma.superAdmin.findFirst({
        where: {
          email: variables.SUPER_ADMIN_EMAIL,
          isDeleted: false,
        },
      });

      if (!existing) {
        await prisma.superAdmin.create({
          data: {
            name: 'Super Admin',
            password: await hashPassword(variables.SUPER_ADMIN_PASSWORD),
            roleId: role.id,
            isDeleted: false,
            email: variables.SUPER_ADMIN_EMAIL,
          },
        });
      }
    }
  } catch (error) {
    console.log('error', error);
  }
};
