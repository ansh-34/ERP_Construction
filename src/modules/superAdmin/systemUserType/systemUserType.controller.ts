import type { Request, Response } from 'express';
import { HttpStatus } from '@constants/index';
import { resolveHttpStatus } from '@/utils/httpError';
import { systemUserTypeService } from './systemUserType.service';

export const systemUserTypeController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userType = await systemUserTypeService.create(req.body);

      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'System user type created successfully',
        data: userType,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create system user type';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },

  list: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userTypes, pagination } = await systemUserTypeService.list(
        req.query,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'System user types fetched successfully',
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
          : 'Failed to fetch system user types';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },

  getById: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userType = await systemUserTypeService.getById(req.params.id);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'System user type fetched successfully',
        data: userType,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch system user type';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },

  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userType = await systemUserTypeService.update(
        req.params.id,
        req.body,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'System user type updated successfully',
        data: userType,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update system user type';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },

  softDelete: async (req: Request, res: Response): Promise<Response> => {
    try {
      await systemUserTypeService.softDelete(req.params.id);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'System user type deleted successfully',
        data: null,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete system user type';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },
};
