import type { Request, Response } from 'express';
import { HttpStatus } from '@constants/index';
import { resolveHttpStatus } from '@/utils/httpError';
import { adminUserTypeService } from './adminUserType.service';

export const adminUserTypeController = {
  list: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userTypes, pagination } = await adminUserTypeService.list(
        req.user!.adminId,
        req.query,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Admin user types fetched successfully',
        pagination: {
          currentCount: userTypes.length,
          ...pagination,
        },
        data: userTypes,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch admin user types';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },
};
