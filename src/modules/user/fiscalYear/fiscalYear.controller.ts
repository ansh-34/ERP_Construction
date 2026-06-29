import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { FiscalYearService } from '../../domain/fiscalYear/fiscalYear.service.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';

export const closeFiscalYearAsUser = async (req: Request, res: Response) => {
  try {
    const data = await FiscalYearService.close(
      req.user!.domainId,
      req.params.id,
      { userId: req.user!.userId },
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Fiscal year closed successfully',
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to close fiscal year';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};
