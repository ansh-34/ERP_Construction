import type { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { resolveHttpStatus } from '@/utils/httpError';
import { machineryInventoryService } from './machineryInventory.service';

export const machineryInventoryController = {
  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { machineryInventories, pagination } =
        await machineryInventoryService.getAll(
          req.user!.domainId,
          req.user!.adminId,
          req.query,
        );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Machinery inventory fetched successfully',
        pagination,
        data: machineryInventories,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch machinery inventory';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },

  getById: async (req: Request, res: Response): Promise<Response> => {
    try {
      const machineryInventory = await machineryInventoryService.getById(
        req.params.id,
        req.user!.domainId,
        req.user!.adminId,
      );

      if (!machineryInventory) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Machinery inventory not found',
        });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Machinery inventory fetched successfully',
        data: machineryInventory,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch machinery inventory';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },
};
