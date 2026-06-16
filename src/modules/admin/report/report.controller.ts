import type { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { HttpStatus } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import {
  AdminReportService,
  type ReportWorkbookWorksheet,
} from './report.service.js';

function buildWorkbook(
  worksheets: ReportWorkbookWorksheet[],
): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Infoware Construction ERP';
  workbook.created = new Date();

  worksheets.forEach(({ name, columns, rows }) => {
    const worksheet = workbook.addWorksheet(name);
    worksheet.columns = columns.map((column) => ({
      header: column,
      key: column,
      width: Math.max(15, Math.min(column.length + 5, 30)),
    }));
    worksheet.addRows(rows);
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E78' },
    };
  });

  return workbook;
}

async function sendWorkbook(
  res: Response,
  worksheets: ReportWorkbookWorksheet[],
  filenamePrefix: string,
): Promise<Response> {
  const workbook = buildWorkbook(worksheets);
  const buffer = await workbook.xlsx.writeBuffer();
  const date = new Date().toISOString().slice(0, 10);

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filenamePrefix}-${date}.xlsx"`,
  );

  return res.status(HttpStatus.OK).send(Buffer.from(buffer));
}

type ReportQuery = {
  domainIds?: string[];
  search?: string;
  country?: string;
  projectId?: string;
  userId?: string;
  machineryId?: string;
  vehicleId?: string;
  productId?: string;
  vendorId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  startDate?: string;
  endDate?: string;
};

function scope(req: Request): { adminId: string; language: string } {
  return {
    adminId: req.user!.userId,
    language: (req.headers.language as string) || 'en',
  };
}

export const adminReportController = {
  listAccessibleDomains: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { adminId, language } = scope(req);
      const { domainIds, search } = req.query as ReportQuery;

      const domains = await AdminReportService.listAccessibleDomains(
        adminId,
        { domainIds, search },
        language,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Domains fetched successfully',
        data: domains,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch domains';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getProjectSummary: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { adminId, language } = scope(req);
      const { domainIds, search, country } = req.query as ReportQuery;

      const report = await AdminReportService.getProjectSummary(
        adminId,
        { domainIds, search, country },
        language,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Report fetched successfully',
        data: report,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  exportProjectSummary: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { adminId, language } = scope(req);
      const { domainIds, search, country, projectId } =
        req.query as ReportQuery;

      const worksheets = await AdminReportService.getProjectWorkbookWorksheets(
        adminId,
        { domainIds, search, country, projectId },
        language,
      );

      return sendWorkbook(res, worksheets, 'admin-project-summary-report');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to export report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getProjectUserTask: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { adminId, language } = scope(req);
      const { domainIds, search, projectId, userId } = req.query as ReportQuery;

      const report = await AdminReportService.getProjectUserTask(
        adminId,
        { domainIds, search, projectId, userId },
        language,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Report fetched successfully',
        data: report,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  exportProjectUserTask: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { adminId, language } = scope(req);
      const { domainIds, search, projectId, userId } = req.query as ReportQuery;

      const worksheets =
        await AdminReportService.getProjectUserTaskWorkbookWorksheets(
          adminId,
          { domainIds, search, projectId, userId },
          language,
        );

      return sendWorkbook(res, worksheets, 'admin-project-user-task-report');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to export report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getProjectUserTaskSummary: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { adminId, language } = scope(req);
      const { domainIds, search, projectId, userId } = req.query as ReportQuery;

      const report = await AdminReportService.getProjectUserTaskSummary(
        adminId,
        { domainIds, search, projectId, userId },
        language,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Report fetched successfully',
        data: report,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getMachineSummary: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { adminId, language } = scope(req);
      const { domainIds, search, projectId, machineryId } =
        req.query as ReportQuery;

      const report = await AdminReportService.getMachineSummary(
        adminId,
        { domainIds, search, projectId, machineryId },
        language,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Report fetched successfully',
        data: report,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getMachineSummaryDashboard: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { adminId, language } = scope(req);
      const { domainIds, search, projectId, machineryId } =
        req.query as ReportQuery;

      const report = await AdminReportService.getMachineSummaryDashboard(
        adminId,
        { domainIds, search, projectId, machineryId },
        language,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Report fetched successfully',
        data: report,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  exportMachineSummary: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { adminId, language } = scope(req);
      const { domainIds, search, projectId, machineryId, vehicleId } =
        req.query as ReportQuery;

      const worksheets = await AdminReportService.getMachineWorkbookWorksheets(
        adminId,
        { domainIds, search, projectId, machineryId, vehicleId },
        language,
      );

      return sendWorkbook(
        res,
        worksheets,
        'admin-machine-vehicle-summary-report',
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to export report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getProductInventory: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { adminId, language } = scope(req);
      const { domainIds, search, productId, status } = req.query as ReportQuery;

      const report = await AdminReportService.getProductInventory(
        adminId,
        { domainIds, search, productId, status },
        language,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Report fetched successfully',
        data: report,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  exportProductInventory: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { adminId, language } = scope(req);
      const { domainIds, search, productId, status } = req.query as ReportQuery;

      const worksheets =
        await AdminReportService.getProductInventoryWorkbookWorksheets(
          adminId,
          { domainIds, search, productId, status },
          language,
        );

      return sendWorkbook(res, worksheets, 'admin-product-inventory-report');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to export report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getVendorPurchaseHistory: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { adminId, language } = scope(req);
      const { domainIds, search, vendorId, projectId } =
        req.query as ReportQuery;

      const report = await AdminReportService.getVendorPurchaseHistory(
        adminId,
        { domainIds, search, vendorId, projectId },
        language,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Report fetched successfully',
        data: report,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  exportVendorPurchaseHistory: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { adminId, language } = scope(req);
      const { domainIds, search, vendorId, projectId } =
        req.query as ReportQuery;

      const worksheets =
        await AdminReportService.getVendorPurchaseHistoryWorkbookWorksheets(
          adminId,
          { domainIds, search, vendorId, projectId },
          language,
        );

      return sendWorkbook(
        res,
        worksheets,
        'admin-vendor-purchase-history-report',
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to export report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getProductTransactionHistory: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { adminId, language } = scope(req);
      const { domainIds, search, productId, projectId, startDate, endDate } =
        req.query as ReportQuery;

      const report = await AdminReportService.getProductTransactionHistory(
        adminId,
        { domainIds, search, productId, projectId, startDate, endDate },
        language,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Report fetched successfully',
        data: report,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  exportProductTransactionHistory: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { adminId, language } = scope(req);
      const { domainIds, search, productId, projectId, startDate, endDate } =
        req.query as ReportQuery;

      const worksheets =
        await AdminReportService.getProductTransactionHistoryWorkbookWorksheets(
          adminId,
          { domainIds, search, productId, projectId, startDate, endDate },
          language,
        );

      return sendWorkbook(
        res,
        worksheets,
        'admin-product-transaction-history-report',
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to export report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
