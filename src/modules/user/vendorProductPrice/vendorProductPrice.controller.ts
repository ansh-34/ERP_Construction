import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { VendorProductPriceService } from './vendorProductPrice.service.js';

export const createVendorProductPrice = async (req: Request, res: Response) => {
  try {
    const record = await VendorProductPriceService.create(
      req.user!.domainId,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.VENDOR_PRODUCT_PRICE.CREATED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.VENDOR_PRODUCT_PRICE.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listVendorProductPrices = async (req: Request, res: Response) => {
  try {
    const { data, pagination } = await VendorProductPriceService.findAll(
      req.user!.domainId,
      req.query,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.VENDOR_PRODUCT_PRICE.RETRIEVED,
      pagination: { ...pagination },
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.VENDOR_PRODUCT_PRICE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getVendorProductPriceById = async (
  req: Request,
  res: Response,
) => {
  try {
    const record = await VendorProductPriceService.findOne(
      req.user!.domainId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.VENDOR_PRODUCT_PRICE.RETRIEVED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.VENDOR_PRODUCT_PRICE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const updateVendorProductPrice = async (req: Request, res: Response) => {
  try {
    const record = await VendorProductPriceService.update(
      req.user!.domainId,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.VENDOR_PRODUCT_PRICE.UPDATED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.VENDOR_PRODUCT_PRICE.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteVendorProductPrice = async (req: Request, res: Response) => {
  try {
    await VendorProductPriceService.softDelete(
      req.user!.domainId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.VENDOR_PRODUCT_PRICE.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.VENDOR_PRODUCT_PRICE.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const importVendorProductPrices = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.file) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const result = await VendorProductPriceService.importExcel(
      req.file.path,
      req.user!.domainId,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.VENDOR_PRODUCT_PRICE.IMPORT_SUCCESS,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.VENDOR_PRODUCT_PRICE.IMPORT_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const exportVendorProductPrices = async (
  req: Request,
  res: Response,
) => {
  try {
    const filePath = await VendorProductPriceService.exportExcel(
      req.user!.domainId,
    );

    res.download(filePath, 'vendor_product_prices.xlsx', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      import('fs').then((fs) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.VENDOR_PRODUCT_PRICE.EXPORT_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
