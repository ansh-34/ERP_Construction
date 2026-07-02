import type { Request, Response } from 'express';
import { HttpStatus } from '@constants/index';
import { resolveHttpStatus } from '@/utils/httpError';
import { userTypeService } from './userType.service';

export const userTypeController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userType = await userTypeService.create(req.body);

      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'User type created successfully',
        data: userType,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to create user type';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },

  list: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userTypes, pagination } = await userTypeService.list(req.query);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'User types fetched successfully',
        pagination: {
          currentCount: userTypes.length,
          ...pagination,
        },
        data: userTypes,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch user types';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },

  getById: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userType = await userTypeService.getById(req.params.id);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'User type fetched successfully',
        data: userType,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch user type';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },

  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userType = await userTypeService.update(req.params.id, req.body);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'User type updated successfully',
        data: userType,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update user type';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },

  softDelete: async (req: Request, res: Response): Promise<Response> => {
    try {
      await userTypeService.softDelete(req.params.id);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'User type deleted successfully',
        data: null,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete user type';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },
};
