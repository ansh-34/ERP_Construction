import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { CustomerPaymentService } from './customerPayment.service.js';

const errorResponse = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  return res
    .status(resolveHttpStatus(message))
    .json({ success: false, message });
};

export const createCustomerPayment = async (req: Request, res: Response) => {
  try {
    const data = await CustomerPaymentService.create(
      req.user!.domainId,
      req.user!.adminId,
      req.user?.userId,
      req.body,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Customer payment created successfully',
      data,
    });
  } catch (error) {
    return errorResponse(res, error, 'Failed to create customer payment');
  }
};

export const listCustomerPayments = async (req: Request, res: Response) => {
  try {
    const { data, pagination } = await CustomerPaymentService.list(
      req.user!.domainId,
      req.user!.adminId,
      req.query,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Customer payments retrieved successfully',
      pagination: { currentCount: data.length, ...pagination },
      data,
    });
  } catch (error) {
    return errorResponse(res, error, 'Failed to list customer payments');
  }
};

export const getCustomerPaymentById = async (req: Request, res: Response) => {
  try {
    const data = await CustomerPaymentService.getById(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Customer payment retrieved successfully',
      data,
    });
  } catch (error) {
    return errorResponse(res, error, 'Failed to get customer payment');
  }
};

export const updateCustomerPayment = async (req: Request, res: Response) => {
  try {
    const data = await CustomerPaymentService.update(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
      req.body,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Customer payment updated successfully',
      data,
    });
  } catch (error) {
    return errorResponse(res, error, 'Failed to update customer payment');
  }
};

export const deleteCustomerPayment = async (req: Request, res: Response) => {
  try {
    await CustomerPaymentService.delete(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Customer payment deleted successfully',
      data: null,
    });
  } catch (error) {
    return errorResponse(res, error, 'Failed to delete customer payment');
  }
};
