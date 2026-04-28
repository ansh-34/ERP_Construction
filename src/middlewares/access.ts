import { StatusEnum } from '@/constants';
import prisma from '@/infra/database/prisma/prisma.client';

export const checkPermission =
  (moduleCode: string, permissionCode: string) =>
  async (req: any, res: any, next: any) => {
    try {
      const roleId = req.user?.roleId;

      if (!roleId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      const permission = await prisma.roleModulePermission.findFirst({
        where: {
          role_id: roleId,
          is_deleted: false,
          status: StatusEnum.ACTIVE,
          module: {
            code: moduleCode,
            is_deleted: false,
            status: StatusEnum.ACTIVE,
          },
          permission: {
            code: permissionCode,
            is_deleted: false,
            status: StatusEnum.ACTIVE,
          },
        },
        select: {
          id: true,
        },
      });

      if (!permission) {
        return res.status(403).json({
          message: "Forbidden: You don't have permission",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Permission check failed',
      });
    }
  };
