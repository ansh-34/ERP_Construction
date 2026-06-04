import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { HttpStatus } from '@constants/httpStatus';
import { resolveHttpStatus } from '@/utils/httpError';
import { reportService, type ReportWorkbookWorksheet } from './report.service';

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

export const reportController = {
  getProjectSummary: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language = (req.headers.language as string) || 'en';
      const { country } = req.query as { country?: string };

      const report = await reportService.getProjectSummary(
        req.user!.domainId,
        { country },
        language,
      );

      return res.status(HttpStatus.OK).json({
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
      const language = (req.headers.language as string) || 'en';
      const { country, projectId } = req.query as {
        export: 'xlsx';
        country?: string;
        projectId?: string;
      };

      const worksheets = await reportService.getProjectWorkbookWorksheets(
        req.user!.domainId,
        { country, projectId },
        language,
      );

      return sendWorkbook(res, worksheets, 'project-summary-report');
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
      const language = (req.headers.language as string) || 'en';
      const { projectId, userId } = req.query as {
        projectId?: string;
        userId?: string;
      };
      const report = await reportService.getProjectUserTaskReport(
        req.user!.domainId,
        { projectId, userId },
        language,
      );

      return res.status(HttpStatus.OK).json({
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
      const language = (req.headers.language as string) || 'en';
      const { projectId, userId } = req.query as {
        export: 'xlsx';
        projectId?: string;
        userId?: string;
      };
      const worksheets =
        await reportService.getProjectUserTaskWorkbookWorksheets(
          req.user!.domainId,
          { projectId, userId },
          language,
        );

      return sendWorkbook(res, worksheets, 'project-user-task-report');
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
      const language = (req.headers.language as string) || 'en';
      const { productId, status } = req.query as {
        productId?: string;
        status?: 'ACTIVE' | 'INACTIVE';
      };

      const report = await reportService.getProductInventoryReport(
        req.user!.domainId,
        { productId, status },
        language,
      );

      return res.status(HttpStatus.OK).json({
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
      const language = (req.headers.language as string) || 'en';
      const { productId, status } = req.query as {
        export: 'xlsx';
        productId?: string;
        status?: 'ACTIVE' | 'INACTIVE';
      };

      const worksheets =
        await reportService.getProductInventoryWorkbookWorksheets(
          req.user!.domainId,
          { productId, status },
          language,
        );

      return sendWorkbook(res, worksheets, 'product-inventory-report');
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
      const language = (req.headers.language as string) || 'en';
      const { vendorId, projectId } = req.query as {
        vendorId?: string;
        projectId?: string;
      };

      const report = await reportService.getVendorPurchaseHistoryReport(
        req.user!.domainId,
        { vendorId, projectId },
        language,
      );

      return res.status(HttpStatus.OK).json({
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
      const language = (req.headers.language as string) || 'en';
      const { vendorId, projectId } = req.query as {
        export: 'xlsx';
        vendorId?: string;
        projectId?: string;
      };

      const worksheets =
        await reportService.getVendorPurchaseHistoryWorkbookWorksheets(
          req.user!.domainId,
          { vendorId, projectId },
          language,
        );

      return sendWorkbook(res, worksheets, 'vendor-purchase-history-report');
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
      const language = (req.headers.language as string) || 'en';
      const { productId, projectId, startDate, endDate } = req.query as {
        productId?: string;
        projectId?: string;
        startDate?: string;
        endDate?: string;
      };

      const report = await reportService.getProductTransactionHistoryReport(
        req.user!.domainId,
        { productId, projectId, startDate, endDate },
        language,
      );

      return res.status(HttpStatus.OK).json({
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
      const language = (req.headers.language as string) || 'en';
      const { productId, projectId, startDate, endDate } = req.query as {
        export: 'xlsx';
        productId?: string;
        projectId?: string;
        startDate?: string;
        endDate?: string;
      };

      const worksheets =
        await reportService.getProductTransactionHistoryWorkbookWorksheets(
          req.user!.domainId,
          { productId, projectId, startDate, endDate },
          language,
        );

      return sendWorkbook(
        res,
        worksheets,
        'product-transaction-history-report',
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to export report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getMachineSummary: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language = (req.headers.language as string) || 'en';
      const { projectId, machineryId } = req.query as {
        projectId?: string;
        machineryId?: string;
      };
      const report = await reportService.getMachineSummaryReport(
        req.user!.domainId,
        { projectId, machineryId },
        language,
      );

      return res.status(HttpStatus.OK).json({
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
      const language = (req.headers.language as string) || 'en';
      const { projectId, machineryId } = req.query as {
        export: 'xlsx';
        projectId?: string;
        machineryId?: string;
      };
      const worksheets = await reportService.getMachineWorkbookWorksheets(
        req.user!.domainId,
        { projectId, machineryId },
        language,
      );

      return sendWorkbook(res, worksheets, 'machine-summary-report');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to export report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
