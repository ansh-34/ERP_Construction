import { Router } from 'express';
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
  createVendorProductPriceParamsSchema,
  listVendorProductPricesQuerySchema,
  vendorProductPriceIdParamSchema,
  updateVendorProductPriceBodySchema,
} from './vendorProductPrice.validator.js';

const router = Router();

router.post(
  '/:id/product-prices',
  validate(createVendorProductPriceParamsSchema, 'params'),
  validate(createVendorProductPriceBodySchema, 'body'),
  createVendorProductPrice,
);

router.get(
  '/product-prices',
  validate(listVendorProductPricesQuerySchema, 'query'),
  listVendorProductPrices,
);

router.get('/product-prices/export', exportVendorProductPrices);

router.post(
  '/product-prices/import',
  upload.single('file'),
  importVendorProductPrices,
);

router.get(
  '/product-prices/:id',
  validate(vendorProductPriceIdParamSchema, 'params'),
  getVendorProductPriceById,
);

router.put(
  '/product-prices',
  validate(updateVendorProductPriceBodySchema, 'body'),
  updateVendorProductPrice,
);

router.delete(
  '/product-prices/:id',
  validate(vendorProductPriceIdParamSchema, 'params'),
  deleteVendorProductPrice,
);

export default router;
