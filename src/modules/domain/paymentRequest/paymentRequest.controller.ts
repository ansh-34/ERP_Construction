import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { PaymentRequestService } from './paymentRequest.service.js';

export const createPaymentRequest = async (req: Request, res: Response) => {
  try {
    const request = await PaymentRequestService.createPaymentRequest(
      req.user!.domainId,
      req.user!.userId,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.PAYMENT_REQUEST.CREATED,
      data: request,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PAYMENT_REQUEST.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listPaymentRequests = async (req: Request, res: Response) => {
  try {
    const { paymentRequests, pagination } =
      await PaymentRequestService.listPaymentRequests(
        req.user!.domainId,
        req.query as PaginationQuery,
      );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PAYMENT_REQUEST.RETRIEVED,
      pagination: {
        currentCount: paymentRequests.length,
        ...pagination,
      },
      data: paymentRequests,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PAYMENT_REQUEST.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getPaymentRequestById = async (req: Request, res: Response) => {
  try {
    const request = await PaymentRequestService.getPaymentRequestById(
      req.user!.domainId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PAYMENT_REQUEST.RETRIEVED,
      data: request,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PAYMENT_REQUEST.NOT_FOUND;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const updatePaymentRequest = async (req: Request, res: Response) => {
  try {
    const request = await PaymentRequestService.updatePaymentRequest(
      req.user!.domainId,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PAYMENT_REQUEST.UPDATED,
      data: request,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PAYMENT_REQUEST.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deletePaymentRequest = async (req: Request, res: Response) => {
  try {
    await PaymentRequestService.deletePaymentRequest(
      req.user!.domainId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PAYMENT_REQUEST.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PAYMENT_REQUEST.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
