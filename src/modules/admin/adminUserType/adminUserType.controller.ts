import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { AdminUserTypeService } from './adminUserType.service.js';

export const selectAdminUserTypes = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.userId;
    const { language = 'en' } = req.headers;
    const result = await AdminUserTypeService.select(
      adminId!,
      req.body,
      language as string,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Admin user types selected successfully',
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to select admin user types';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const listAdminUserTypes = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.userId;
    const { language = 'en' } = req.headers;
    const { userTypes, pagination } = await AdminUserTypeService.list(
      adminId!,
      req.query,
      language as string,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Admin user types retrieved successfully',
      pagination: {
        currentCount: userTypes.length,
        ...pagination,
      },
      data: userTypes,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to list admin user types';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const getAdminUserType = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.userId;
    const { language = 'en' } = req.headers;
    const userType = await AdminUserTypeService.getById(
      adminId!,
      req.params.id,
      language as string,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Admin user type retrieved successfully',
      data: userType,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to get admin user type';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const deleteAdminUserType = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.userId;
    await AdminUserTypeService.delete(adminId!, req.params.id);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Admin user type deleted successfully',
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to delete admin user type';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};
