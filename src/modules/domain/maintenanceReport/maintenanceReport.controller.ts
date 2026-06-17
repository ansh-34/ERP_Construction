import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { resolveHttpStatus } from '@/utils/httpError';
import { maintenanceReportService } from './maintenanceReport.service';
import type { MaintenanceAssetType } from '@repositories/index';

export const maintenanceReportController = {
  getReport: async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        domainId,
        groupBy,
        assetType,
        vehicleId,
        machineryId,
        fromDate,
        toDate,
      } = req.query as {
        domainId?: string;
        groupBy?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
        assetType?: MaintenanceAssetType;
        vehicleId?: string;
        machineryId?: string;
        fromDate?: string;
        toDate?: string;
      };

      const report = await maintenanceReportService.getReport(
        domainId ?? '',
        req.user!.adminId,
        {
          groupBy,
          assetType,
          vehicleId,
          machineryId,
          fromDate,
          toDate,
        },
      );

      return res.status(HttpStatus.OK).json({
        message: 'Maintenance report fetched successfully',
        data: report,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch maintenance report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
