import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { AccountingPeriodService } from '../../domain/accountingPeriod/accountingPeriod.service.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';

export const closeAccountingPeriodAsUser = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await AccountingPeriodService.close(
      req.user!.domainId,
      req.params.id,
      { userId: req.user!.userId },
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Accounting period closed successfully',
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to close accounting period';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};
