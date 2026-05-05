import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { PermissionService } from './permission.service.js';

export const createPermission = async (req: Request, res: Response) => {
  try {
    const permission = await PermissionService.createPermission(req.body);

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.PERMISSION.CREATED,
      data: permission,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PERMISSION.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listPermissions = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const { permissions, pagination } = await PermissionService.listPermissions(
      req.query as PaginationQuery & { searchKey?: string },
      language as string,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PERMISSION.RETRIEVED,
      pagination: {
        currentCount: permissions.length,
        ...pagination,
      },
      data: permissions,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.PERMISSION.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getPermission = async (req: Request, res: Response) => {
  try {
    const { language } = req.headers;
    const permission = await PermissionService.getPermission(
      req.params.id,
      language as string | null,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PERMISSION.RETRIEVED,
      data: permission,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.PERMISSION.NOT_FOUND;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const updatePermission = async (req: Request, res: Response) => {
  try {
    const updated = await PermissionService.updatePermission(
      req.params.id,
      req.body,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PERMISSION.UPDATED,
      data: updated,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PERMISSION.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deletePermission = async (req: Request, res: Response) => {
  try {
    await PermissionService.deletePermission(req.params.id);

    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: Messages.PERMISSION.DELETED });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PERMISSION.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
