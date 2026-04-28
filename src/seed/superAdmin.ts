import prisma from '@/infra/database/prisma/prisma.client';
import { hashPassword } from '@/utils/bcrypt';
import { variables } from '@/config';

export const superAdminData = async () => {
  try {
    const role = await prisma.role.findFirst({
      where: {
        domain_id: null,
        code: 'SUPER_ADMIN',
      },
    });

    if (role) {
      const existing = await prisma.superAdmin.findFirst({
        where: {
          email: variables.SUPER_ADMIN_EMAIL,
          is_deleted: false,
        },
      });

      if (!existing) {
        await prisma.superAdmin.create({
          data: {
            name: 'Super Admin',
            password: await hashPassword(variables.SUPER_ADMIN_PASSWORD),
            role_id: role.id,
            is_deleted: false,
            email: variables.SUPER_ADMIN_EMAIL,
          },
        });
      }
    }
  } catch (error) {
    console.log('error', error);
  }
};
