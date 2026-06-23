import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { InvoiceService } from './invoice.service.js';

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
    const langCode = req.headers.language as string | undefined;
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
