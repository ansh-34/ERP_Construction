import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { resolveHttpStatus } from '@/utils/httpError';
import { movementReportService } from './movementReport.service';
import type { MaintenanceAssetType, MovementType } from '@repositories/index';

export const movementReportController = {
  getReport: async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        domainId,
        assetType,
        movementType,
        vehicleId,
        machineryId,
        projectId,
        fromDate,
        toDate,
      } = req.query as {
        domainId?: string;
        assetType?: MaintenanceAssetType;
        movementType?: MovementType;
        vehicleId?: string;
        machineryId?: string;
        projectId?: string;
        fromDate?: string;
        toDate?: string;
      };

      const report = await movementReportService.getReport(
        domainId ?? '',
        req.user!.adminId,
        {
          assetType,
          movementType,
          vehicleId,
          machineryId,
          projectId,
          fromDate,
          toDate,
        },
      );

      return res.status(HttpStatus.OK).json({
        message: 'Movement report fetched successfully',
        data: report,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch movement report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
