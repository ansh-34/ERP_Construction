import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { ProductService } from './product.service.js';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await ProductService.createProduct(
      req.user!.domainId,
      req.body,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.PRODUCT.CREATED,
      data: product,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.PRODUCT.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listProducts = async (req: Request, res: Response) => {
  try {
    const { products, pagination } = await ProductService.listProducts(
      req.user!.domainId,
      req.query as PaginationQuery,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT.RETRIEVED,
      pagination: {
        currentCount: products.length,
        ...pagination,
      },
      data: products,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.PRODUCT.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await ProductService.getProductById(
      req.user!.domainId,
      req.params.id,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT.RETRIEVED,
      data: product,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.PRODUCT.NOT_FOUND;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await ProductService.deleteProduct(req.user!.domainId, req.params.id);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.PRODUCT.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await ProductService.updateProduct(
      req.user!.domainId,
      req.params.id,
      req.body
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PRODUCT.UPDATED,
      data: product,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.PRODUCT.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
