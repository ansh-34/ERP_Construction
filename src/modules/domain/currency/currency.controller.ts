import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { CurrencyService } from './currency.service.js';

export const listCurrencies = async (req: Request, res: Response) => {
  try {
    const { currencies, pagination } = await CurrencyService.listLanguages(
      req.query,
      req.user!.adminId!,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.CURRENCY.RETRIEVED,
      pagination: {
        currentCount: currencies.length,
        ...pagination,
      },
      data: currencies,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.CURRENCY.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getCurrency = async (req: Request, res: Response) => {
  try {
    const currency = await CurrencyService.getCurrency(req.params.id);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.CURRENCY.RETRIEVED,
      data: currency,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.CURRENCY.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
