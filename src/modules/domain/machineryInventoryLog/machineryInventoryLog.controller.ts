import type { Request, Response } from 'express';
import { HttpStatus, StatusEnum } from '@constants/index';
import { resolveHttpStatus } from '@/utils/httpError';
import { machineryInventoryLogService } from './machineryInventoryLog.service';
import type { MachineryInventoryTransactionType } from '@repositories/index';

export const machineryInventoryLogController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const log = await machineryInventoryLogService.create({
        ...req.body,
        transactionType: req.body
          .transactionType as MachineryInventoryTransactionType,
        domainId: req.user!.domainId,
        adminId: req.user!.adminId,
        status: req.body.status ?? StatusEnum.ACTIVE,
      });

      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Machinery inventory log created successfully',
        data: log,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create machinery inventory log';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },

  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { machineryInventoryLogs, pagination } =
        await machineryInventoryLogService.getAll(
          req.user!.domainId,
          req.user!.adminId,
          req.query,
        );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Machinery inventory logs fetched successfully',
        pagination,
        data: machineryInventoryLogs,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch machinery inventory logs';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },

  getById: async (req: Request, res: Response): Promise<Response> => {
    try {
      const log = await machineryInventoryLogService.getById(
        req.params.id,
        req.user!.domainId,
        req.user!.adminId,
      );

      if (!log) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Machinery inventory log not found',
        });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Machinery inventory log fetched successfully',
        data: log,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch machinery inventory log';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },

  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const log = await machineryInventoryLogService.update(
        req.params.id,
        req.user!.domainId,
        req.user!.adminId,
        req.body,
      );

      if (!log) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Machinery inventory log not found',
        });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Machinery inventory log updated successfully',
        data: log,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update machinery inventory log';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },

  softDelete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const log = await machineryInventoryLogService.softDelete(
        req.params.id,
        req.user!.domainId,
        req.user!.adminId,
      );

      if (!log) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Machinery inventory log not found',
        });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Machinery inventory log deleted successfully',
        data: null,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete machinery inventory log';
      return res.status(resolveHttpStatus(message)).json({
        success: false,
        message,
      });
    }
  },
};
