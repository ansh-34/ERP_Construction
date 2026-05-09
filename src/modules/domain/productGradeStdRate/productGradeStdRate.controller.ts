import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { ProductGradeStdRateService } from './productGradeStdRate.service.js';

export const createProductGradeStdRate = async (
  req: Request,
  res: Response,
) => {
  try {
    const record = await ProductGradeStdRateService.create(
      req.user!.domainId,
      req.params.productId,
      req.params.gradeId,
      req.body as any,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.PRODUCT_GRADE_STD_RATE.CREATED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PRODUCT_GRADE_STD_RATE.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listProductGradeStdRates = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const result = await ProductGradeStdRateService.findAll(
      req.user!.domainId,
      req.params.productId,
      req.params.gradeId,
      req.query as any,
      language as string,
    );
    return res
      .status(HttpStatus.OK)
      .json({
        success: true,
        message: Messages.PRODUCT_GRADE_STD_RATE.RETRIEVED,
        data: result,
      });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PRODUCT_GRADE_STD_RATE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getProductGradeStdRateById = async (
  req: Request,
  res: Response,
) => {
  try {
    const { language } = req.headers;
    const record = await ProductGradeStdRateService.findOne(
      req.user!.domainId,
      req.params.productId,
      req.params.gradeId,
      req.params.id,
      language as string | null,
    );
    return res
      .status(HttpStatus.OK)
      .json({
        success: true,
        message: Messages.PRODUCT_GRADE_STD_RATE.RETRIEVED,
        data: record,
      });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PRODUCT_GRADE_STD_RATE.NOT_FOUND;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const updateProductGradeStdRate = async (
  req: Request,
  res: Response,
) => {
  try {
    const record = await ProductGradeStdRateService.update(
      req.user!.domainId,
      req.params.productId,
      req.params.gradeId,
      req.params.id,
      req.body as any,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT_GRADE_STD_RATE.UPDATED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PRODUCT_GRADE_STD_RATE.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteProductGradeStdRate = async (
  req: Request,
  res: Response,
) => {
  try {
    await ProductGradeStdRateService.softDelete(
      req.user!.domainId,
      req.params.productId,
      req.params.gradeId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT_GRADE_STD_RATE.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PRODUCT_GRADE_STD_RATE.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
