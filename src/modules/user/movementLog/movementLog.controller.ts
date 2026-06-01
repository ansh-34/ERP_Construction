import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { StatusEnum } from '@constants/index';
import { resolveHttpStatus } from '@/utils/httpError';
import { movementLogService } from '@/modules/domain/movementLog/movementLog.service';
import type { MaintenanceAssetType, MovementType } from '@repositories/index';

export const movementLogController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        code,
        movementType,
        assetType,
        vehicleId,
        machineryId,
        projectId,
        fromLocation,
        toLocation,
        startDateTime,
        endDateTime,
        startMeterReading,
        endMeterReading,
        notes,
        status,
      } = req.body as {
        code?: string;
        movementType?: MovementType;
        assetType?: MaintenanceAssetType;
        vehicleId?: string | null;
        machineryId?: string | null;
        projectId?: string | null;
        fromLocation?: string | null;
        toLocation?: string | null;
        startDateTime?: string;
        endDateTime?: string;
        startMeterReading?: number | null;
        endMeterReading?: number | null;
        notes?: string | null;
        status?: StatusEnum;
      };
      const log = await movementLogService.create({
        code: code ?? '',
        movementType: movementType ?? 'OTHER',
        assetType: assetType ?? 'VEHICLE',
        ...(vehicleId !== undefined && { vehicleId }),
        ...(machineryId !== undefined && { machineryId }),
        ...(projectId !== undefined && { projectId }),
        ...(fromLocation !== undefined && { fromLocation }),
        ...(toLocation !== undefined && { toLocation }),
        startDateTime: startDateTime ?? '',
        endDateTime: endDateTime ?? '',
        ...(startMeterReading !== undefined && { startMeterReading }),
        ...(endMeterReading !== undefined && { endMeterReading }),
        ...(notes !== undefined && { notes }),
        domainId: req.user!.domainId,
        adminId: req.user!.adminId,
        status: status ?? StatusEnum.ACTIVE,
      });
      return res.status(HttpStatus.CREATED).json({
        message: 'Movement log created successfully',
        data: log,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create movement log';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { movementLogs, pagination } = await movementLogService.getAll(
        req.user!.domainId,
        req.user!.adminId,
        req.query,
      );
      return res.status(HttpStatus.OK).json({
        message: 'Movement logs fetched successfully',
        pagination: { currentCount: movementLogs.length, ...pagination },
        data: movementLogs,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch movement logs';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getById: async (req: Request, res: Response): Promise<Response> => {
    try {
      const log = await movementLogService.getById(
        req.params.id ?? '',
        req.user!.domainId,
        req.user!.adminId,
      );
      if (!log)
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      return res.status(HttpStatus.OK).json({
        message: 'Movement log fetched successfully',
        data: log,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch movement log';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const log = await movementLogService.softDelete(
        req.params.id ?? '',
        req.user!.domainId,
        req.user!.adminId,
      );
      if (!log)
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      return res.status(HttpStatus.OK).json({
        message: 'Movement log deleted successfully',
        data: log,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete movement log';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
