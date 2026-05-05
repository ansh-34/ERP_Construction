import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { ModulePermissionService } from './modulePermission.service.js';

export const createModulePermissions = async (req: Request, res: Response) => {
  try {
    const record = await ModulePermissionService.createModulePermissions(
      req.body,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.MODULE_PERMISSION.SET,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.MODULE_PERMISSION.SET_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listModulePermissions = async (req: Request, res: Response) => {
  try {
    const { modulePermissions, pagination } =
      await ModulePermissionService.listModulePermissions(
        req.query as PaginationQuery,
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

export const deleteModulePermissions = async (req: Request, res: Response) => {
  try {
    await ModulePermissionService.deleteModulePermissions(req.params.id);

    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: Messages.MODULE_PERMISSION.DELETED });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.MODULE_PERMISSION.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
