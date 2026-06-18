import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { ProductGradeLastPurchaseRateService } from './productGradeLastPurchaseRate.service.js';

export const listProductGradeLastPurchaseRates = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await ProductGradeLastPurchaseRateService.findAll(
      req.user!.domainId,
      req.query as any,
    );
    const { data, ...pagination } = result as any;
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT_GRADE_LAST_PURCHASE_RATE.RETRIEVED,
      pagination,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PRODUCT_GRADE_LAST_PURCHASE_RATE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getProductGradeLastPurchaseRateById = async (
  req: Request,
  res: Response,
) => {
  try {
    const lang = (req.query.lang as string) || null;
    const record = await ProductGradeLastPurchaseRateService.findOne(
      req.user!.domainId,
      req.params.id,
      lang,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT_GRADE_LAST_PURCHASE_RATE.RETRIEVED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PRODUCT_GRADE_LAST_PURCHASE_RATE.NOT_FOUND;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
