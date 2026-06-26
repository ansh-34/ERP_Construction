import type { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import {
  RawMaterialPurchaseRequestService,
  type PurchaseOrderExcelWorksheet,
} from './rawMaterialPurchaseRequest.service.js';
import { ApprovalStatus } from '../../../infra/database/prisma/generated/prisma/client/enums.js';

function buildWorkbook(
  worksheets: PurchaseOrderExcelWorksheet[],
): ExcelJS.Workbook {
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
  worksheets: PurchaseOrderExcelWorksheet[],
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

export const createRawMaterialPurchaseRequest = async (
  req: Request,
  res: Response,
) => {
  try {
    const request = await RawMaterialPurchaseRequestService.createRequest(
      req.user!.domainId,
      req.user!.userId,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.RAW_MATERIAL_PURCHASE_REQUEST.CREATED,
      data: request,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.RAW_MATERIAL_PURCHASE_REQUEST.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listRawMaterialPurchaseRequests = async (
  req: Request,
  res: Response,
) => {
  try {
    const { requests, pagination } =
      await RawMaterialPurchaseRequestService.listRequests(
        req.user!.domainId,
        req.query as PaginationQuery,
      );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.RAW_MATERIAL_PURCHASE_REQUEST.RETRIEVED,
      pagination: {
        currentCount: requests.length,
        ...pagination,
      },
      data: requests,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.RAW_MATERIAL_PURCHASE_REQUEST.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getRawMaterialPurchaseRequestById = async (
  req: Request,
  res: Response,
) => {
  try {
    const request = await RawMaterialPurchaseRequestService.getRequestById(
      req.user!.domainId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.RAW_MATERIAL_PURCHASE_REQUEST.RETRIEVED,
      data: request,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.RAW_MATERIAL_PURCHASE_REQUEST.NOT_FOUND;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const updateRawMaterialPurchaseRequest = async (
  req: Request,
  res: Response,
) => {
  try {
    const request = await RawMaterialPurchaseRequestService.updateRequest(
      req.user!.domainId,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.RAW_MATERIAL_PURCHASE_REQUEST.UPDATED,
      data: request,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.RAW_MATERIAL_PURCHASE_REQUEST.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteRawMaterialPurchaseRequest = async (
  req: Request,
  res: Response,
) => {
  try {
    await RawMaterialPurchaseRequestService.deleteRequest(
      req.user!.domainId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.RAW_MATERIAL_PURCHASE_REQUEST.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.RAW_MATERIAL_PURCHASE_REQUEST.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteRawMaterialPurchaseRequestByCode = async (
  req: Request,
  res: Response,
) => {
  try {
    await RawMaterialPurchaseRequestService.deleteRequestByCode(
      req.user!.domainId,
      req.params.code,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.RAW_MATERIAL_PURCHASE_REQUEST.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.RAW_MATERIAL_PURCHASE_REQUEST.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const updateRawMaterialPurchaseRequestByCodeAndProduct = async (
  req: Request,
  res: Response,
) => {
  try {
    const request =
      await RawMaterialPurchaseRequestService.updateRequestByCodeAndProduct(
        req.user!.domainId,
        req.params.code,
        req.params.productId,
        req.body,
      );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.RAW_MATERIAL_PURCHASE_REQUEST.UPDATED,
      data: request,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.RAW_MATERIAL_PURCHASE_REQUEST.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getRawMaterialPurchaseRequestByCode = async (
  req: Request,
  res: Response,
) => {
  try {
    const requestGroup =
      await RawMaterialPurchaseRequestService.getRequestByCode(
        req.user!.domainId,
        req.params.code,
      );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.RAW_MATERIAL_PURCHASE_REQUEST.RETRIEVED,
      data: requestGroup,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.RAW_MATERIAL_PURCHASE_REQUEST.NOT_FOUND;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

/**
 * Unified approve/reject endpoint by code.
 * Body: { code: string, approvalStatus: 'APPROVED' | 'REJECTED' }
 */
export const approveOrRejectRawMaterialPurchaseRequests = async (
  req: Request,
  res: Response,
) => {
  try {
    const result =
      await RawMaterialPurchaseRequestService.approveOrRejectRequests(
        req.user!.domainId,
        req.body.code,
        req.body.approvalStatus as ApprovalStatus,
      );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.RAW_MATERIAL_PURCHASE_REQUEST.APPROVAL_UPDATED,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.RAW_MATERIAL_PURCHASE_REQUEST.APPROVAL_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

// --- Purchase Order Controllers ---

export const listPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const { purchaseOrders, pagination } =
      await RawMaterialPurchaseRequestService.listPurchaseOrders(
        req.user!.domainId,
        req.query as PaginationQuery,
      );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PURCHASE_ORDER.RETRIEVED,
      pagination: {
        currentCount: purchaseOrders.length,
        ...pagination,
      },
      data: purchaseOrders,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PURCHASE_ORDER.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getPurchaseOrderById = async (req: Request, res: Response) => {
  try {
    const po = await RawMaterialPurchaseRequestService.getPurchaseOrderById(
      req.user!.domainId,
      req.params.poId,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PURCHASE_ORDER.RETRIEVED,
      data: po,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PURCHASE_ORDER.NOT_FOUND;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const exportPurchaseOrderById = async (req: Request, res: Response) => {
  try {
    const { worksheets, filenamePrefix } =
      await RawMaterialPurchaseRequestService.exportPurchaseOrderExcel(
        req.user!.domainId,
        req.params.poId,
      );

    return sendWorkbook(res, worksheets, filenamePrefix);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PURCHASE_ORDER.NOT_FOUND;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

// export const updatePurchaseOrder = async (req: Request, res: Response) => {
//   try {
//     const po = await RawMaterialPurchaseRequestService.updatePurchaseOrder(
//       req.user!.domainId,
//       req.params.poId,
//       req.body,
//     );
//     return res.status(HttpStatus.OK).json({
//       success: true,
//       message: Messages.PURCHASE_ORDER.UPDATED,
//       data: po,
//     });
//   } catch (error) {
//     const message =
//       error instanceof Error ? error.message : Messages.PURCHASE_ORDER.UPDATE_FAILED;
//     const statusCode = resolveHttpStatus(message);
//     return res.status(statusCode).json({ success: false, message });
//   }
// };

// // --- Purchase Order Product Controllers ---

// export const createPoProduct = async (req: Request, res: Response) => {
//   try {
//     const product = await RawMaterialPurchaseRequestService.createPoProduct(
//       req.user!.domainId,
//       req.params.poId,
//       req.body,
//     );
//     return res.status(HttpStatus.CREATED).json({
//       success: true,
//       message: 'Purchase order product created successfully',
//       data: product,
//     });
//   } catch (error) {
//     const message =
//       error instanceof Error ? error.message : 'Failed to create purchase order product';
//     const statusCode = resolveHttpStatus(message);
//     return res.status(statusCode).json({ success: false, message });
//   }
// };

export const listPoProducts = async (req: Request, res: Response) => {
  try {
    const langCode = req.headers.language as string | undefined;
    const products = await RawMaterialPurchaseRequestService.listPoProducts(
      req.user!.domainId,
      req.params.poId,
      langCode,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Purchase order products retrieved successfully',
      data: products,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to retrieve purchase order products';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

// export const updatePoProduct = async (req: Request, res: Response) => {
//   try {
//     const product = await RawMaterialPurchaseRequestService.updatePoProduct(
//       req.user!.domainId,
//       req.params.poId,
//       req.params.productId,
//       req.body,
//     );
//     return res.status(HttpStatus.OK).json({
//       success: true,
//       message: 'Purchase order product updated successfully',
//       data: product,
//     });
//   } catch (error) {
//     const message =
//       error instanceof Error ? error.message : 'Failed to update purchase order product';
//     const statusCode = resolveHttpStatus(message);
//     return res.status(statusCode).json({ success: false, message });
//   }
// };

// export const deletePoProduct = async (req: Request, res: Response) => {
//   try {
//     await RawMaterialPurchaseRequestService.deletePoProduct(
//       req.user!.domainId,
//       req.params.poId,
//       req.params.productId,
//     );
//     return res.status(HttpStatus.OK).json({
//       success: true,
//       message: 'Purchase order product deleted successfully',
//       data: null,
//     });
//   } catch (error) {
//     const message =
//       error instanceof Error ? error.message : 'Failed to delete purchase order product';
//     const statusCode = resolveHttpStatus(message);
//     return res.status(statusCode).json({ success: false, message });
//   }
// };
