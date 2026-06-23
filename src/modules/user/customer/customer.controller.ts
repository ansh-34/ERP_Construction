import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { CustomerService } from './customer.service.js';

const errorResponse = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  return res
    .status(resolveHttpStatus(message))
    .json({ success: false, message });
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const data = await CustomerService.create(
      req.user!.domainId,
      req.user!.adminId,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.CUSTOMER.CREATED,
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.CUSTOMER.CREATE_FAILED);
  }
};

export const listCustomers = async (req: Request, res: Response) => {
  try {
    const { data, pagination } = await CustomerService.findAll(
      req.user!.domainId,
      req.user!.adminId,
      req.query,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.CUSTOMER.LIST_RETRIEVED,
      pagination: { currentCount: data.length, ...pagination },
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.CUSTOMER.LIST_FAILED);
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const data = await CustomerService.findOne(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.CUSTOMER.RETRIEVED,
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.CUSTOMER.LIST_FAILED);
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const data = await CustomerService.update(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.CUSTOMER.UPDATED,
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.CUSTOMER.UPDATE_FAILED);
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    await CustomerService.softDelete(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.CUSTOMER.DELETED,
      data: null,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.CUSTOMER.DELETE_FAILED);
  }
};
