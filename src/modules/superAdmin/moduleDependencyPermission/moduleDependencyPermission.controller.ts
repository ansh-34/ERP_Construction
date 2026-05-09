import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { ModuleDependencyPermissionService } from './moduleDependencyPermission.service.js';

export const createModuleDependencyPermission = async (
  req: Request,
  res: Response,
) => {
  try {
    const dependency =
      await ModuleDependencyPermissionService.createModuleDependencyPermission(
        req.body,
      );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.MODULE_DEPENDENCY_PERMISSION.CREATED,
      data: dependency,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.MODULE_DEPENDENCY.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteModuleDependencyPermission = async (
  req: Request,
  res: Response,
) => {
  try {
    await ModuleDependencyPermissionService.deleteModuleDependencyPermission(
      req.params.id,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.MODULE_DEPENDENCY_PERMISSION.DELETED,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.MODULE_DEPENDENCY.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
