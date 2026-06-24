import type { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { resolveHttpStatus } from '@/utils/httpError';
import { alertService } from './alert.service';

export const alertController = {
  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { alerts, pagination } = await alertService.getAll(
        req.user!.domainId,
        req.user!.adminId,
        req.query,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Alerts fetched successfully',
        pagination,
        data: alerts,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch alerts';
      return res
        .status(resolveHttpStatus(message))
        .json({ success: false, message });
    }
  },

  getById: async (req: Request, res: Response): Promise<Response> => {
    try {
      const alert = await alertService.getById(
        req.params.id,
        req.user!.domainId,
        req.user!.adminId,
      );

      if (!alert) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: 'Alert not found' });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Alert fetched successfully',
        data: alert,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch alert';
      return res
        .status(resolveHttpStatus(message))
        .json({ success: false, message });
    }
  },

  updateStatus: async (req: Request, res: Response): Promise<Response> => {
    try {
      const alert = await alertService.updateStatus(
        req.params.id,
        req.user!.domainId,
        req.user!.adminId,
        req.body.alertStatus,
      );

      if (!alert) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: 'Alert not found' });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Alert status updated successfully',
        data: alert,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update alert';
      return res
        .status(resolveHttpStatus(message))
        .json({ success: false, message });
    }
  },
};
