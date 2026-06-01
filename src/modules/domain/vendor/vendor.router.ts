import { Router } from 'express';
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

vendorRouter.post('/', validate(createVendorBodySchema, 'body'), createVendor);
vendorRouter.get('/', validate(listVendorsQuerySchema, 'query'), listVendors);
vendorRouter.get(
  '/:id',
  validate(vendorIdParamSchema, 'params'),
  getVendorById,
);
vendorRouter.put(
  '/:id',
  validate(vendorIdParamSchema, 'params'),
  validate(updateVendorBodySchema, 'body'),
  updateVendor,
);
vendorRouter.delete(
  '/:id',
  validate(vendorIdParamSchema, 'params'),
  deleteVendor,
);

export default vendorRouter;
