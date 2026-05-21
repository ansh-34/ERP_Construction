import type { Request, Response, NextFunction } from 'express';
import prisma from '../infra/database/prisma/prisma.client.js';

const authorize = (moduleName: string, action: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { roleId, domainId } = req.user!;
      if (!roleId) {
        console.warn('[authorize] Forbidden: user has no role', {
          moduleName,
          action,
          userId: req.user?.userId,
          domainId,
          path: req.originalUrl,
          method: req.method,
        });
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }
      const mod = await prisma.module.findFirst({
        where: { code: moduleName, isDeleted: false },
      });
      if (!mod) {
        console.warn('[authorize] Module not found', {
          moduleName,
          action,
          userId: req.user?.userId,
          roleId,
          domainId,
          path: req.originalUrl,
          method: req.method,
        });
        res.status(404).json({ success: false, message: 'Module not found' });
        return;
      }
      const moduleId = mod.id;
      const actionUpper = action.toUpperCase();

      // 1. Check direct permission on this module
      const directPermission = await prisma.roleModulePermission.findFirst({
        where: { roleId, moduleId, domainId },
      });
      if (
        directPermission &&
        directPermission.permissions.includes(actionUpper)
      ) {
        next();
        return;
      }

      // // 2. Check permission through module dependencies
      // const dependencies = await prisma.moduleDependency.findMany({
      //   where: {
      //     dependentModuleId: moduleId,
      //     moduleDependencyPermissions: {
      //       some: {
      //         permission: {
      //           code: actionUpper,
      //           isDeleted: false,
      //         },
      //       },
      //     },
      //   },
      // });

      // if (dependencies.length > 0) {
      //   const parentModuleIds = dependencies.map((d) => d.moduleId);

      //   // Check if the role has the action on any parent module
      //   const parentPermission = await prisma.roleModulePermission.findFirst({
      //     where: {
      //       roleId,
      //       moduleId: { in: parentModuleIds },
      //       domainId,
      //       permissions: { has: actionUpper },
      //     },
      //   });

      //   if (parentPermission) {
      //     next();
      //     return;
      //   }
      // }

      console.warn('[authorize] Forbidden: missing module permission', {
        moduleName,
        moduleId,
        action: actionUpper,
        userId: req.user?.userId,
        roleId,
        domainId,
        existingPermissions: directPermission?.permissions ?? [],
        hasRoleModulePermission: Boolean(directPermission),
        path: req.originalUrl,
        method: req.method,
      });
      res.status(403).json({ success: false, message: 'Forbidden' });
    } catch (err) {
      console.error('Authorization error:', err);
      res.status(403).json({ success: false, message: 'Forbidden' });
    }
  };
};

export default authorize;
