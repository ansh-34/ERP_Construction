import type { Request, Response } from 'express';
import { LogsService } from './logs.service.js';
import { HttpStatus } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { AnalyticsQuery } from './logs.validator.js';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await LogsService.getAnalytics(
      req.query as unknown as AnalyticsQuery,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Analytics retrieved successfully',
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to retrieve analytics';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listLogs = async (req: Request, res: Response) => {
  try {
    const data = await LogsService.listLogs();
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Logs retrieved successfully',
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to retrieve logs';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
