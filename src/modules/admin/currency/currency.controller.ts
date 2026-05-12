import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { CurrencyService } from './currency.service.js';

export const listCurrencies = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.userId;
    const { language = 'en' } = req.headers;
    const { currencies, pagination } = await CurrencyService.listCurrencies(
      req.query,
      adminId!,
      language as string,
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
    const adminId = req.user?.userId;
    const { language } = req.headers;
    const currency = await CurrencyService.getCurrency(
      req.params.id,
      adminId!,
      language as string | undefined,
    );

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

export const updateCurrency = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.userId;
    const currency = await CurrencyService.updateCurrency(
      req.params.id,
      adminId!,
      req.body as {
        status?: 'active' | 'inactive';
        isEnabled?: boolean;
        isDefault?: boolean;
      },
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.CURRENCY.UPDATED,
      data: currency,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.CURRENCY.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
