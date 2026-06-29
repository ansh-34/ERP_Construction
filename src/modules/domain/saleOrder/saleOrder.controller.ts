import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { SaleOrderService } from './saleOrder.service.js';

export const createSaleOrder = async (req: Request, res: Response) => {
  try {
    const saleOrder = await SaleOrderService.create(
      req.user!.domainId,
      req.user!.adminId,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.SALE_ORDER.CREATED,
      data: saleOrder,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.SALE_ORDER.CREATE_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const listSaleOrders = async (req: Request, res: Response) => {
  try {
    const lang = (req.headers.lang as string) || 'en';
    const { data, pagination } = await SaleOrderService.findAll(
      req.user!.domainId,
      req.user!.adminId,
      req.query as PaginationQuery,
      lang,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.SALE_ORDER.LIST_RETRIEVED,
      pagination: { currentCount: data.length, ...pagination },
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.SALE_ORDER.LIST_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const getSaleOrderById = async (req: Request, res: Response) => {
  try {
    const lang = (req.headers.lang as string) || null;
    const saleOrder = await SaleOrderService.findOne(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
      lang,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.SALE_ORDER.RETRIEVED,
      data: saleOrder,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.SALE_ORDER.NOT_FOUND;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const updateSaleOrder = async (req: Request, res: Response) => {
  try {
    const saleOrder = await SaleOrderService.update(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.SALE_ORDER.UPDATED,
      data: saleOrder,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.SALE_ORDER.UPDATE_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const listSaleOrderProducts = async (req: Request, res: Response) => {
  try {
    const lang = (req.headers.lang as string) || 'en';
    const products = await SaleOrderService.listProducts(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
      lang,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.SALE_ORDER.RETRIEVED,
      data: products,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.SALE_ORDER.NOT_FOUND;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const removeSaleOrderProduct = async (req: Request, res: Response) => {
  try {
    await SaleOrderService.removeProduct(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
      req.params.productId,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.SALE_ORDER.PRODUCT_REMOVED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.SALE_ORDER.PRODUCT_NOT_FOUND;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const deleteSaleOrder = async (req: Request, res: Response) => {
  try {
    await SaleOrderService.softDelete(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.SALE_ORDER.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.SALE_ORDER.DELETE_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};
