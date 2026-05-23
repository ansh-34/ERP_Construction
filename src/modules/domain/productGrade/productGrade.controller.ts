import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { ProductGradeService } from './productGrade.service.js';

export const createProductGrade = async (req: Request, res: Response) => {
  try {
    const record = await ProductGradeService.create(
      req.user!.domainId,
      req.params.productId,
      req.body as any,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.PRODUCT_GRADE.CREATED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PRODUCT_GRADE.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listAllDomainProductGrades = async (
  req: Request,
  res: Response,
) => {
  try {
    const { language = 'en' } = req.headers;
    const result = await ProductGradeService.findAllInDomain(
      req.user!.domainId,
      req.query as any,
      language as string,
    );
    const { data, ...pagination } = result as any;
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT_GRADE.RETRIEVED,
      pagination,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PRODUCT_GRADE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listProductGradesWithStdRates = async (
  req: Request,
  res: Response,
) => {
  try {
    const { language = 'en' } = req.headers;
    const result = await ProductGradeService.findAllWithStdRates(
      req.user!.domainId,
      req.params.productId,
      req.query as any,
      language as string,
    );
    // findAllWithStdRates returns { product, grades: { data, total, page, limit, totalPages } }
    // It's already slightly different, but the user said "list all product grades dont put two data field same with list standard rates".
    // I'll flatten it to avoid nested `grades.data` if that's what's happening.
    // Let's just leave findAllWithStdRates as is unless I restructure it completely. Wait, no.
    // Actually, I'll just destructure result.grades for listProductGradesWithStdRates.
    const { product, grades } = result;
    const { data, ...pagination } = grades as any;
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT_GRADE.RETRIEVED,
      product,
      pagination,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PRODUCT_GRADE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listProductGrades = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const result = await ProductGradeService.findAll(
      req.user!.domainId,
      req.params.productId,
      req.query as any,
      language as string,
    );
    const { data, ...pagination } = result as any;
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT_GRADE.RETRIEVED,
      pagination,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PRODUCT_GRADE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getProductGradeById = async (req: Request, res: Response) => {
  try {
    const { language } = req.headers;
    const record = await ProductGradeService.findOne(
      req.user!.domainId,
      req.params.productId,
      req.params.id,
      language as string | null,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT_GRADE.RETRIEVED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.PRODUCT_GRADE.NOT_FOUND;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const updateProductGrade = async (req: Request, res: Response) => {
  try {
    const record = await ProductGradeService.update(
      req.user!.domainId,
      req.params.productId,
      req.params.id,
      req.body as any,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT_GRADE.UPDATED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PRODUCT_GRADE.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteProductGrade = async (req: Request, res: Response) => {
  try {
    await ProductGradeService.softDelete(
      req.user!.domainId,
      req.params.productId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT_GRADE.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PRODUCT_GRADE.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
