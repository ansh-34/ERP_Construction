import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createVendor,
  deleteVendor,
  getVendorById,
  listVendors,
  updateVendor,
} from './vendor.controller.js';
import {
  createVendorBodySchema,
  listVendorsQuerySchema,
  updateVendorBodySchema,
  vendorIdParamSchema,
} from './vendor.validator.js';

const vendorRouter = Router();

vendorRouter.post(
  '/',
  authorize('VENDOR', 'CREATE'),
  validate(createVendorBodySchema, 'body'),
  createVendor,
);
vendorRouter.get(
  '/',
  authorize('VENDOR', 'READ'),
  validate(listVendorsQuerySchema, 'query'),
  listVendors,
);
vendorRouter.get(
  '/:id',
  authorize('VENDOR', 'READ'),
  validate(vendorIdParamSchema, 'params'),
  getVendorById,
);
vendorRouter.put(
  '/:id',
  authorize('VENDOR', 'UPDATE'),
  validate(vendorIdParamSchema, 'params'),
  validate(updateVendorBodySchema, 'body'),
  updateVendor,
);
vendorRouter.delete(
  '/:id',
  authorize('VENDOR', 'DELETE'),
  validate(vendorIdParamSchema, 'params'),
  deleteVendor,
);

export default vendorRouter;
