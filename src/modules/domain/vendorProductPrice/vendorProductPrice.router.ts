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
  listVendorProductPricesQuerySchema,
  vendorProductPriceIdParamSchema,
  updateVendorProductPriceBodySchema,
} from './vendorProductPrice.validator.js';

// upload middleware imported from middlewares/upload (memory storage)

export const vendorProductPriceRouter = (): Router => {
  const router = Router();

  router.post(
    '/',
    validate(createVendorProductPriceBodySchema, 'body'),
    createVendorProductPrice,
  );

  router.get(
    '/',
    validate(listVendorProductPricesQuerySchema, 'query'),
    listVendorProductPrices,
  );

  router.get('/export', exportVendorProductPrices);

  router.post('/import', upload.single('file'), importVendorProductPrices);

  router.get(
    '/:id',
    validate(vendorProductPriceIdParamSchema, 'params'),
    getVendorProductPriceById,
  );

  router.put(
    '/:id',
    validate(vendorProductPriceIdParamSchema, 'params'),
    validate(updateVendorProductPriceBodySchema, 'body'),
    updateVendorProductPrice,
  );

  router.delete(
    '/:id',
    validate(vendorProductPriceIdParamSchema, 'params'),
    deleteVendorProductPrice,
  );

  return router;
};
