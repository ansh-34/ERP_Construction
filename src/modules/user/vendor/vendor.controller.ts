import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { VendorService } from './vendor.service.js';

const errorResponse = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  return res
    .status(resolveHttpStatus(message))
    .json({ success: false, message });
};

export const createVendor = async (req: Request, res: Response) => {
  try {
    const data = await VendorService.create(req.user!.domainId, req.body);
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.VENDOR.CREATED,
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.VENDOR.CREATE_FAILED);
  }
};

export const listVendors = async (req: Request, res: Response) => {
  try {
    const { data, pagination } = await VendorService.findAll(
      req.user!.domainId,
      req.query,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.VENDOR.RETRIEVED,
      pagination,
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.VENDOR.LIST_FAILED);
  }
};

export const getVendorById = async (req: Request, res: Response) => {
  try {
    const data = await VendorService.findOne(req.user!.domainId, req.params.id);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.VENDOR.RETRIEVED,
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.VENDOR.LIST_FAILED);
  }
};

export const updateVendor = async (req: Request, res: Response) => {
  try {
    const data = await VendorService.update(
      req.user!.domainId,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.VENDOR.UPDATED,
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.VENDOR.UPDATE_FAILED);
  }
};

export const deleteVendor = async (req: Request, res: Response) => {
  try {
    await VendorService.softDelete(req.user!.domainId, req.params.id);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.VENDOR.DELETED,
      data: null,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.VENDOR.DELETE_FAILED);
  }
};
