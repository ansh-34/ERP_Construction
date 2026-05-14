import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { CurrencyService } from './currency.service.js';
import { CreateCurrencyData } from './currency.validator.js';

export const createCurrency = async (req: Request, res: Response) => {
  try {
    const currency = await CurrencyService.createCurrency(
      req.body as CreateCurrencyData,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.CURRENCY.CREATED,
      data: currency,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.CURRENCY.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listCurrencies = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;

    const { currencies, pagination } = await CurrencyService.listCurrencies(
      req.query,
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
    const { language } = req.headers;

    const currency = await CurrencyService.getCurrency(
      req.params.id,
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
    const currency = await CurrencyService.updateCurrency(
      req.params.id,
      req.body as {
        name?: any;
        code?: string;
        dir?: 'ltr' | 'rtl';
        flag?: string;
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

export const deleteCurrency = async (req: Request, res: Response) => {
  try {
    await CurrencyService.deleteCurrency(req.params.id);

    return res.status(HttpStatus.NO_CONTENT).json({
      success: true,
      message: Messages.CURRENCY.DELETED,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.CURRENCY.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
