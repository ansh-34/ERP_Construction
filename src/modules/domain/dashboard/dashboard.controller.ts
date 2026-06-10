import { HttpStatus, Messages } from '@/constants';
import { resolveHttpStatus } from '@/utils/httpError';
import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const data = await DashboardService.getDashboardAnalytics(
      req.user!.domainId,
      language as string,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.DASHBOARD.RETRIEVED,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.DASHBOARD.NOT_FOUND;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};
