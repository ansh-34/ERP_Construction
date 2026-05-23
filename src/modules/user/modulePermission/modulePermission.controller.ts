import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { ModulePermissionService } from './modulePermission.service.js';

export const listModulePermissions = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const { modulePermissions, pagination } =
      await ModulePermissionService.listModulePermissions(
        req.query as PaginationQuery & {
          searchKey?: string;
          moduleId?: string;
          permissionId?: string;
        },
        language as string,
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.MODULE_PERMISSION.RETRIEVED,
      pagination: {
        currentCount: modulePermissions.length,
        ...pagination,
      },
      data: modulePermissions,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.MODULE_PERMISSION.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
