import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { CustomerRateService } from './customerRate.service.js';

const errorResponse = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  return res
    .status(resolveHttpStatus(message))
    .json({ success: false, message });
};

export const createCustomerRate = async (req: Request, res: Response) => {
  try {
    const data = await CustomerRateService.create(
      req.user!.domainId,
      req.user!.adminId,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.CUSTOMER_RATE.CREATED,
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.CUSTOMER_RATE.CREATE_FAILED);
  }
};

export const listCustomerRates = async (req: Request, res: Response) => {
  try {
    const lang = (req.headers.lang as string) || null;
    const { data, pagination } = await CustomerRateService.findAll(
      req.user!.domainId,
      req.user!.adminId,
      req.query,
      lang,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.CUSTOMER_RATE.LIST_RETRIEVED,
      pagination: { currentCount: data.length, ...pagination },
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.CUSTOMER_RATE.LIST_FAILED);
  }
};

export const getCustomerRateById = async (req: Request, res: Response) => {
  try {
    const lang = (req.headers.lang as string) || 'en';
    const data = await CustomerRateService.findOne(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
      lang,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.CUSTOMER_RATE.RETRIEVED,
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.CUSTOMER_RATE.LIST_FAILED);
  }
};

export const updateCustomerRate = async (req: Request, res: Response) => {
  try {
    const data = await CustomerRateService.update(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.CUSTOMER_RATE.UPDATED,
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.CUSTOMER_RATE.UPDATE_FAILED);
  }
};

export const deleteCustomerRate = async (req: Request, res: Response) => {
  try {
    await CustomerRateService.softDelete(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.CUSTOMER_RATE.DELETED,
      data: null,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.CUSTOMER_RATE.DELETE_FAILED);
  }
};
