import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { FiscalYearService } from './fiscalYear.service.js';

const errorResponse = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  return res
    .status(resolveHttpStatus(message))
    .json({ success: false, message });
};

export const createFiscalYear = async (req: Request, res: Response) => {
  try {
    const data = await FiscalYearService.create(
      req.user!.domainId,
      req.user!.adminId,
      req.body,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Fiscal year created successfully',
      data,
    });
  } catch (error) {
    return errorResponse(res, error, 'Failed to create fiscal year');
  }
};

export const listFiscalYears = async (req: Request, res: Response) => {
  try {
    const { data, pagination } = await FiscalYearService.list(
      req.user!.domainId,
      req.query,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Fiscal years retrieved successfully',
      pagination: { currentCount: data.length, ...pagination },
      data,
    });
  } catch (error) {
    return errorResponse(res, error, 'Failed to list fiscal years');
  }
};

export const getFiscalYearById = async (req: Request, res: Response) => {
  try {
    const data = await FiscalYearService.getById(
      req.user!.domainId,
      req.params.id,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Fiscal year retrieved successfully',
      data,
    });
  } catch (error) {
    return errorResponse(res, error, 'Failed to get fiscal year');
  }
};

export const updateFiscalYear = async (req: Request, res: Response) => {
  try {
    const data = await FiscalYearService.update(
      req.user!.domainId,
      req.params.id,
      req.body,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Fiscal year updated successfully',
      data,
    });
  } catch (error) {
    return errorResponse(res, error, 'Failed to update fiscal year');
  }
};

export const closeFiscalYear = async (req: Request, res: Response) => {
  try {
    const data = await FiscalYearService.close(
      req.user!.domainId,
      req.params.id,
      { adminId: req.user!.adminId },
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Fiscal year closed successfully',
      data,
    });
  } catch (error) {
    return errorResponse(res, error, 'Failed to close fiscal year');
  }
};
