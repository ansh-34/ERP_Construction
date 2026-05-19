import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { RawMaterialPurchaseRequestService } from './rawMaterialPurchaseRequest.service.js';
import { ApprovalStatus } from '../../../infra/database/prisma/generated/prisma/client/enums.js';

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

/**
 * Unified approve/reject endpoint.
 * Accepts both a single UUID string and an array of UUIDs via `ids` in body.
 * Body: { ids: string | string[], approvalStatus: 'APPROVED' | 'REJECTED' }
 */
export const approveOrRejectRawMaterialPurchaseRequests = async (
  req: Request,
  res: Response,
) => {
  try {
    const result =
      await RawMaterialPurchaseRequestService.approveOrRejectRequests(
        req.user!.domainId,
        req.body.ids,
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
    const products = await RawMaterialPurchaseRequestService.listPoProducts(
      req.user!.domainId,
      req.params.poId,
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
