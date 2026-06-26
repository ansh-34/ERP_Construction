import type { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { GrnService, type GrnExcelWorksheet } from './grn.service.js';
import { ApprovalStatus } from '../../../infra/database/prisma/generated/prisma/client/enums.js';

function buildWorkbook(worksheets: GrnExcelWorksheet[]): ExcelJS.Workbook {
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
  worksheets: GrnExcelWorksheet[],
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

export const createGrn = async (req: Request, res: Response) => {
  try {
    const grn = await GrnService.createGrn(
      req.user!.domainId as string,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.GRN.CREATED,
      data: grn,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.GRN.CREATE_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const listGrns = async (req: Request, res: Response) => {
  try {
    const language = req.headers.language as string | undefined;
    const { grns, pagination } = await GrnService.listGrns(
      req.user!.domainId as string,
      req.query as PaginationQuery,
      language,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.GRN.RETRIEVED,
      pagination: { currentCount: grns.length, ...pagination },
      data: grns,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.GRN.LIST_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const getGrnById = async (req: Request, res: Response) => {
  try {
    const grn = await GrnService.getGrnById(
      req.user!.domainId as string,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.GRN.RETRIEVED,
      data: grn,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.GRN.NOT_FOUND;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const exportGrnById = async (req: Request, res: Response) => {
  try {
    const { worksheets, filenamePrefix } = await GrnService.exportGrnExcel(
      req.user!.domainId as string,
      req.params.id,
    );

    return sendWorkbook(res, worksheets, filenamePrefix);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.GRN.NOT_FOUND;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const updateGrn = async (req: Request, res: Response) => {
  try {
    const grn = await GrnService.updateGrn(
      req.user!.domainId as string,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.GRN.UPDATED,
      data: grn,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.GRN.UPDATE_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const deleteGrn = async (req: Request, res: Response) => {
  try {
    await GrnService.deleteGrn(req.user!.domainId as string, req.params.id);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.GRN.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.GRN.DELETE_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const approveOrRejectGrn = async (req: Request, res: Response) => {
  try {
    const grn = await GrnService.approveOrRejectGrn(
      req.user!.domainId as string,
      req.params.id,
      req.body.approvalStatus as ApprovalStatus,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.GRN.APPROVAL_UPDATED,
      data: grn,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.GRN.APPROVAL_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const createGrnProduct = async (req: Request, res: Response) => {
  try {
    const product = await GrnService.createGrnProduct(
      req.user!.domainId as string,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Product line item created successfully',
      data: product,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to create product line item';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const listGrnProducts = async (req: Request, res: Response) => {
  try {
    const products = await GrnService.listGrnProducts(
      req.user!.domainId as string,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Product line items retrieved successfully',
      data: products,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to list product line items';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const updateGrnProduct = async (req: Request, res: Response) => {
  try {
    const product = await GrnService.updateGrnProduct(
      req.user!.domainId as string,
      req.params.id,
      req.params.productId,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Product line item updated successfully',
      data: product,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to update product line item';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const deleteGrnProduct = async (req: Request, res: Response) => {
  try {
    await GrnService.deleteGrnProduct(
      req.user!.domainId as string,
      req.params.id,
      req.params.productId,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Product line item deleted successfully',
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to delete product line item';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};
