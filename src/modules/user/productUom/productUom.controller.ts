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
      message: Messages.PRODUCT_UOM.CREATED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PRODUCT_UOM.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listProductUoms = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const { data, total, page, limit, totalPages } =
      await ProductUomService.findAll(
        req.user!.domainId,
        req.params.productId,
        req.query as any,
        language as string,
      );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT_UOM.RETRIEVED,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.PRODUCT_UOM.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listAllDomainProductUoms = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const { data, total, page, limit, totalPages } =
      await ProductUomService.findAllDomainProductUoms(
        req.user!.domainId,
        req.query as any,
        language as string,
      );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT_UOM.RETRIEVED,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.PRODUCT_UOM.LIST_FAILED;
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
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT_UOM.RETRIEVED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.PRODUCT_UOM.NOT_FOUND;
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
      message: Messages.PRODUCT_UOM.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PRODUCT_UOM.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
