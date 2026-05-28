import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { DispatchService } from './dispatch.service.js';

export const getDispatchStats = async (req: Request, res: Response) => {
  try {
    const stats = await DispatchService.getStats(req.user!.domainId);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.DISPATCH.STATS_RETRIEVED,
      data: stats,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.DISPATCH.STATS_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const createDispatch = async (req: Request, res: Response) => {
  try {
    const dispatch = await DispatchService.createDispatch(
      req.user!.domainId,
      req.body,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.DISPATCH.CREATED,
      data: dispatch,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.DISPATCH.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listDispatches = async (req: Request, res: Response) => {
  try {
    const language = req.headers.language as string | undefined;
    const { dispatches, pagination } = await DispatchService.listDispatches(
      req.user!.domainId,
      req.query as PaginationQuery,
      language,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.DISPATCH.RETRIEVED,
      pagination: {
        currentCount: dispatches.length,
        ...pagination,
      },
      data: dispatches,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.DISPATCH.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
