import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { DatePaginationQuery } from '../../../utils/pagination.js';
import { AppErrorService } from './appError.service.js';

export const createAppError = async (req: Request, res: Response) => {
  try {
    const appError = await AppErrorService.createAppError(
      req.user!.domainId as string,
      req.body,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.APP_ERROR.CREATED,
      data: appError,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.APP_ERROR.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listAppErrors = async (req: Request, res: Response) => {
  try {
    const { appErrors, pagination } = await AppErrorService.listAppErrors(
      req.user!.domainId as string,
      req.query as DatePaginationQuery,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.APP_ERROR.RETRIEVED,
      pagination: {
        currentCount: appErrors.length,
        ...pagination,
      },
      data: appErrors,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.APP_ERROR.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
