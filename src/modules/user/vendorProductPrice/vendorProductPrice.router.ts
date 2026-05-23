import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import { upload } from '../../../middlewares/upload.js';
import {
  createVendorProductPrice,
  listVendorProductPrices,
  getVendorProductPriceById,
  updateVendorProductPrice,
  deleteVendorProductPrice,
  importVendorProductPrices,
  exportVendorProductPrices,
} from './vendorProductPrice.controller.js';
import {
  createVendorProductPriceBodySchema,
  listVendorProductPricesQuerySchema,
  vendorProductPriceIdParamSchema,
  updateVendorProductPriceBodySchema,
} from './vendorProductPrice.validator.js';

export const vendorProductPriceRouter = (): Router => {
  const router = Router();

  router.post(
    '/',
    authorize('VENDOR_PRODUCT_PRICE', 'CREATE'),
    validate(createVendorProductPriceBodySchema, 'body'),
    createVendorProductPrice,
  );

  router.get(
    '/',
    authorize('VENDOR_PRODUCT_PRICE', 'READ'),
    validate(listVendorProductPricesQuerySchema, 'query'),
    listVendorProductPrices,
  );

  router.get(
    '/export',
    authorize('VENDOR_PRODUCT_PRICE', 'READ'),
    exportVendorProductPrices,
  );

  router.post(
    '/import',
    authorize('VENDOR_PRODUCT_PRICE', 'CREATE'),
    upload.single('file'),
    importVendorProductPrices,
  );

  router.get(
    '/:id',
    authorize('VENDOR_PRODUCT_PRICE', 'READ'),
    validate(vendorProductPriceIdParamSchema, 'params'),
    getVendorProductPriceById,
  );

  router.put(
    '/:id',
    authorize('VENDOR_PRODUCT_PRICE', 'UPDATE'),
    validate(vendorProductPriceIdParamSchema, 'params'),
    validate(updateVendorProductPriceBodySchema, 'body'),
    updateVendorProductPrice,
  );

  router.delete(
    '/:id',
    authorize('VENDOR_PRODUCT_PRICE', 'DELETE'),
    validate(vendorProductPriceIdParamSchema, 'params'),
    deleteVendorProductPrice,
  );

  return router;
};
