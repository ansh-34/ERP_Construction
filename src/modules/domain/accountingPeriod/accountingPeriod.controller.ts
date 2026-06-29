import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { AccountingPeriodService } from './accountingPeriod.service.js';

const errorResponse = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  return res
    .status(resolveHttpStatus(message))
    .json({ success: false, message });
};

export const createAccountingPeriod = async (req: Request, res: Response) => {
  try {
    const data = await AccountingPeriodService.create(
      req.user!.domainId,
      req.user!.adminId,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Accounting period created successfully',
      data,
    });
  } catch (error) {
    return errorResponse(res, error, 'Failed to create accounting period');
  }
};

export const listAccountingPeriods = async (req: Request, res: Response) => {
  try {
    const { data, pagination } = await AccountingPeriodService.list(
      req.user!.domainId,
      req.query,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Accounting periods retrieved successfully',
      pagination: { currentCount: data.length, ...pagination },
      data,
    });
  } catch (error) {
    return errorResponse(res, error, 'Failed to list accounting periods');
  }
};

export const getAccountingPeriodById = async (req: Request, res: Response) => {
  try {
    const data = await AccountingPeriodService.getById(
      req.user!.domainId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Accounting period retrieved successfully',
      data,
    });
  } catch (error) {
    return errorResponse(res, error, 'Failed to get accounting period');
  }
};

export const updateAccountingPeriod = async (req: Request, res: Response) => {
  try {
    const data = await AccountingPeriodService.update(
      req.user!.domainId,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Accounting period updated successfully',
      data,
    });
  } catch (error) {
    return errorResponse(res, error, 'Failed to update accounting period');
  }
};

export const closeAccountingPeriod = async (req: Request, res: Response) => {
  try {
    const data = await AccountingPeriodService.close(
      req.user!.domainId,
      req.params.id,
      { adminId: req.user!.adminId },
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Accounting period closed successfully',
      data,
    });
  } catch (error) {
    return errorResponse(res, error, 'Failed to close accounting period');
  }
};
