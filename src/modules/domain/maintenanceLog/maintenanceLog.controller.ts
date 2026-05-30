import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { StatusEnum } from '@constants/index';
import { resolveHttpStatus } from '@/utils/httpError';
import { maintenanceLogService } from './maintenanceLog.service';
import type { MaintenanceAssetType } from '@repositories/index';

export const maintenanceLogController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const {
        code,
        date,
        description,
        assetType,
        vehicleId,
        machineryId,
        maintenanceScheduleId,
        expenseAmount,
        meterReading,
        status,
      } = req.body as {
        code?: string;
        date?: string;
        description?: Record<string, unknown>;
        assetType?: MaintenanceAssetType;
        vehicleId?: string | null;
        machineryId?: string | null;
        maintenanceScheduleId?: string | null;
        expenseAmount?: number;
        meterReading?: number | null;
        status?: StatusEnum;
      };

      const log = await maintenanceLogService.create(
        {
          code: code ?? '',
          date: date ?? '',
          description: description ?? {},
          assetType: assetType ?? 'VEHICLE',
          ...(vehicleId !== undefined && { vehicleId }),
          ...(machineryId !== undefined && { machineryId }),
          ...(maintenanceScheduleId !== undefined && {
            maintenanceScheduleId,
          }),
          expenseAmount: expenseAmount ?? 0,
          ...(meterReading !== undefined && { meterReading }),
          domainId: req.user!.domainId,
          adminId: req.user!.adminId,
          status: status ?? StatusEnum.ACTIVE,
        },
        language,
      );

      return res.status(HttpStatus.CREATED).json({
        message: 'Maintenance log created successfully',
        data: log,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create maintenance log';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        null;

      const { maintenanceLogs, pagination } =
        await maintenanceLogService.getAll(
          (req.query.domainId as string) ?? '',
          req.user!.adminId,
          req.query,
          language,
        );

      return res.status(HttpStatus.OK).json({
        message: 'Maintenance logs fetched successfully',
        pagination: {
          currentCount: maintenanceLogs.length,
          ...pagination,
        },
        data: maintenanceLogs,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch maintenance logs';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getById: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };

      const log = await maintenanceLogService.getById(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
        language,
      );

      if (!log) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Maintenance log fetched successfully',
        data: log,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch maintenance log';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };

      const log = await maintenanceLogService.softDelete(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
      );

      if (!log) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Maintenance log deleted successfully',
        data: log,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete maintenance log';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
