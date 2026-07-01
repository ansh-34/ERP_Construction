import type { Request, Response } from 'express';
import { HttpStatus } from '@constants/index';
import { resolveHttpStatus } from '@/utils/httpError';
import { domainUserTypeService } from './domainUserType.service';

export const domainUserTypeController = {
  // GET /domain-user-types/available — global UserTypes for this domain's industry not yet selected
  listAvailable: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userTypes, pagination } =
        await domainUserTypeService.listAvailable(
          req.user!.domainId,
          req.query,
        );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Available user types fetched successfully',
        pagination: { currentCount: userTypes.length, ...pagination },
        data: userTypes,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch available user types';
      return res
        .status(resolveHttpStatus(message))
        .json({ success: false, message });
    }
  },

  // POST /domain-user-types — select one or more global UserTypes to map
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const mapped = await domainUserTypeService.create(
        req.user!.domainId,
        req.user!.adminId,
        req.body.userTypeIds,
      );

      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'User types mapped to domain successfully',
        data: mapped,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to map user types';
      return res
        .status(resolveHttpStatus(message))
        .json({ success: false, message });
    }
  },

  // GET /domain-user-types — list selected (mapped) user types
  list: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userTypes, pagination } = await domainUserTypeService.list(
        req.user!.domainId,
        req.query,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Domain user types fetched successfully',
        pagination: { currentCount: userTypes.length, ...pagination },
        data: userTypes,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch domain user types';
      return res
        .status(resolveHttpStatus(message))
        .json({ success: false, message });
    }
  },

  getById: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userType = await domainUserTypeService.getById(
        req.user!.domainId,
        req.params.id,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Domain user type fetched successfully',
        data: userType,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch domain user type';
      return res
        .status(resolveHttpStatus(message))
        .json({ success: false, message });
    }
  },

  softDelete: async (req: Request, res: Response): Promise<Response> => {
    try {
      await domainUserTypeService.softDelete(req.user!.domainId, req.params.id);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Domain user type removed successfully',
        data: null,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to remove domain user type';
      return res
        .status(resolveHttpStatus(message))
        .json({ success: false, message });
    }
  },
};
