import type { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { resolveHttpStatus } from '@/utils/httpError';
import { inventoryFuelStockService } from './inventoryFuelStock.service';

export const inventoryFuelStockController = {
  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { inventoryFuelStocks, pagination } =
        await inventoryFuelStockService.getAll(
          req.user!.domainId,
          req.user!.adminId,
          req.query,
        );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Inventory fuel stocks fetched successfully',
        pagination,
        data: inventoryFuelStocks,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch inventory fuel stocks';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },

  getById: async (req: Request, res: Response): Promise<Response> => {
    try {
      const stock = await inventoryFuelStockService.getById(
        req.params.id,
        req.user!.domainId,
        req.user!.adminId,
      );

      if (!stock) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Inventory fuel stock not found',
        });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Inventory fuel stock fetched successfully',
        data: stock,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch inventory fuel stock';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },
};
