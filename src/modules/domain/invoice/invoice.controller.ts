import type { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import {
  InvoiceService,
  type InvoiceExcelWorksheet,
} from './invoice.service.js';

function buildWorkbook(worksheets: InvoiceExcelWorksheet[]): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Infoware Construction ERP';
  workbook.created = new Date();

  worksheets.forEach(({ name, columns, rows }) => {
    const worksheet = workbook.addWorksheet(name);
    worksheet.columns = columns.map((column) => ({
      header: column,
      key: column,
      width: Math.max(15, Math.min(column.length + 8, 35)),
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
  worksheets: InvoiceExcelWorksheet[],
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

export const listInvoices = async (req: Request, res: Response) => {
  try {
    const { invoices, pagination } = await InvoiceService.listInvoices(
      req.user!.domainId,
      req.query as PaginationQuery,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.INVOICE.RETRIEVED,
      pagination: { currentCount: invoices.length, ...pagination },
      data: invoices,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVOICE.LIST_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const listActiveInvoices = async (req: Request, res: Response) => {
  try {
    const { invoices, pagination } = await InvoiceService.listActiveInvoices(
      req.user!.domainId,
      req.query as PaginationQuery,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.INVOICE.RETRIEVED,
      pagination: { currentCount: invoices.length, ...pagination },
      data: invoices,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVOICE.LIST_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await InvoiceService.getInvoiceById(
      req.user!.domainId,
      req.params.id,
      req.query as {
        invoiceType?: 'PROFORMA' | 'FINAL';
        lifecycle?: 'ACTIVE' | 'VOID';
      },
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.INVOICE.RETRIEVED,
      data: invoice,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVOICE.NOT_FOUND;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const exportInvoiceById = async (req: Request, res: Response) => {
  try {
    const { worksheets, filenamePrefix } =
      await InvoiceService.exportInvoiceExcel(
        req.user!.domainId,
        req.params.id,
      );

    return sendWorkbook(res, worksheets, filenamePrefix);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVOICE.NOT_FOUND;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const getActiveInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await InvoiceService.getActiveInvoiceById(
      req.user!.domainId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.INVOICE.RETRIEVED,
      data: invoice,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVOICE.NOT_FOUND;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    await InvoiceService.deleteInvoice(req.user!.domainId, req.params.id);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.INVOICE.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVOICE.DELETE_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const listInvoiceItems = async (req: Request, res: Response) => {
  try {
    const langCode = (req.headers.language as string) || 'en';
    const items = await InvoiceService.listInvoiceItems(
      req.user!.domainId,
      req.params.id,
      langCode,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.INVOICE.ITEMS_RETRIEVED,
      data: items,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVOICE.NOT_FOUND;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const generateInvoicesFromPO = async (req: Request, res: Response) => {
  try {
    const invoices = await InvoiceService.generateFromPurchaseOrder(
      req.user!.domainId,
      req.user!.adminId,
      req.params.poId,
      req.user!.userId,
      req.body.assignments,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.INVOICE.GENERATED,
      data: invoices,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVOICE.GENERATE_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const finalizeInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await InvoiceService.finalizeInvoice(
      req.user!.domainId,
      req.params.id,
      req.user!.userId,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.INVOICE.FINALIZED,
      data: invoice,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVOICE.FINALIZE_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const requestInvoicePdf = async (req: Request, res: Response) => {
  try {
    const result = await InvoiceService.requestPdf(
      req.user!.domainId,
      req.params.id,
    );
    return res.status(HttpStatus.ACCEPTED).json({
      success: true,
      message: Messages.INVOICE.PDF_QUEUED,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVOICE.NOT_FOUND;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const getInvoicePdfStatus = async (req: Request, res: Response) => {
  try {
    const result = await InvoiceService.getPdfStatus(
      req.user!.domainId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.INVOICE.PDF_STATUS_RETRIEVED,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVOICE.NOT_FOUND;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};
