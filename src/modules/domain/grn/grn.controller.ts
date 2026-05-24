import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { GrnService } from './grn.service.js';
import { ApprovalStatus } from '../../../infra/database/prisma/generated/prisma/client/enums.js';

export const createGrn = async (req: Request, res: Response) => {
  try {
    const grn = await GrnService.createGrn(req.user!.domainId, req.body);
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
    const { grns, pagination } = await GrnService.listGrns(
      req.user!.domainId,
      req.query as PaginationQuery,
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
    const grn = await GrnService.getGrnById(req.user!.domainId, req.params.id);
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

export const updateGrn = async (req: Request, res: Response) => {
  try {
    const grn = await GrnService.updateGrn(
      req.user!.domainId,
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
    await GrnService.deleteGrn(req.user!.domainId, req.params.id);
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
      req.user!.domainId,
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
      req.user!.domainId,
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
      req.user!.domainId,
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
      req.user!.domainId,
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
      req.user!.domainId,
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
