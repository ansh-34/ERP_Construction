import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { AccountBalanceService } from './accountBalance.service.js';
import { translateResponse } from '../../../utils/translation.js';

const errorResponse = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  return res
    .status(resolveHttpStatus(message))
    .json({ success: false, message });
};

export const listAccountBalances = async (req: Request, res: Response) => {
  try {
    const language = req.headers.language as string | undefined;
    const { data, pagination } = await AccountBalanceService.findAll(
      req.user!.domainId,
      req.user!.adminId,
      req.query,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ACCOUNT_BALANCE.LIST_RETRIEVED,
      pagination: { currentCount: data.length, ...pagination },
      data: translateResponse(data, language || 'en'),
    });
  } catch (error) {
    return errorResponse(res, error, Messages.ACCOUNT_BALANCE.LIST_FAILED);
  }
};

export const getAccountBalanceById = async (req: Request, res: Response) => {
  try {
    const language = req.headers.language as string | undefined;
    const data = await AccountBalanceService.findOne(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ACCOUNT_BALANCE.RETRIEVED,
      data: translateResponse(data, language),
    });
  } catch (error) {
    return errorResponse(res, error, Messages.ACCOUNT_BALANCE.LIST_FAILED);
  }
};
