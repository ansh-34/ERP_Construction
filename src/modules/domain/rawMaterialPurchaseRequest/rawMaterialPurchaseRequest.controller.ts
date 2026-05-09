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
    const request =
      await RawMaterialPurchaseRequestService.createRequest(
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
    const request =
      await RawMaterialPurchaseRequestService.getRequestById(
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
    const request =
      await RawMaterialPurchaseRequestService.updateRequest(
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

export const approveOrRejectRawMaterialPurchaseRequest = async (
  req: Request,
  res: Response,
) => {
  try {
    const request =
      await RawMaterialPurchaseRequestService.approveOrRejectRequest(
        req.user!.domainId,
        req.params.id,
        req.body.approvalStatus as ApprovalStatus,
      );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.RAW_MATERIAL_PURCHASE_REQUEST.APPROVAL_UPDATED,
      data: request,
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