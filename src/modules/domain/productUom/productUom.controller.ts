import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { ProductUomService } from './productUom.service.js';

export const createProductUom = async (req: Request, res: Response) => {
  try {
    const record = await ProductUomService.create(
      req.user!.domainId,
      req.params.productId,
      req.body as any,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Product UOM assigned successfully',
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to assign Product UOM';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listProductUoms = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const result = await ProductUomService.findAll(
      req.user!.domainId,
      req.params.productId,
      req.query as any,
      language as string,
    );
    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: 'Product UOMs retrieved', data: result });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to retrieve Product UOMs';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getProductUomById = async (req: Request, res: Response) => {
  try {
    const { language } = req.headers;
    const record = await ProductUomService.findOne(
      req.user!.domainId,
      req.params.productId,
      req.params.id,
      language as string | null,
    );
    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: 'Product UOM retrieved', data: record });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to retrieve Product UOM';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteProductUom = async (req: Request, res: Response) => {
  try {
    await ProductUomService.softDelete(
      req.user!.domainId,
      req.params.productId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Product UOM removed successfully',
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to remove Product UOM';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
