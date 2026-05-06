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
    return res
      .status(HttpStatus.CREATED)
      .json({
        success: true,
        message: 'Product grade created successfully',
        data: record,
      });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create Product grade';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listProductGrades = async (req: Request, res: Response) => {
  try {
    const result = await ProductGradeService.findAll(
      req.user!.domainId,
      req.params.productId,
      req.query as any,
    );
    return res
      .status(HttpStatus.OK)
      .json({
        success: true,
        message: 'Product grades retrieved',
        data: result,
      });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to retrieve Product grades';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getProductGradeById = async (req: Request, res: Response) => {
  try {
    const record = await ProductGradeService.findOne(
      req.user!.domainId,
      req.params.productId,
      req.params.id,
    );
    return res
      .status(HttpStatus.OK)
      .json({
        success: true,
        message: 'Product grade retrieved',
        data: record,
      });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to retrieve Product grade';
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
    return res
      .status(HttpStatus.OK)
      .json({
        success: true,
        message: 'Product grade updated successfully',
        data: record,
      });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update Product grade';
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
    return res
      .status(HttpStatus.OK)
      .json({
        success: true,
        message: 'Product grade deleted successfully',
        data: null,
      });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete Product grade';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
