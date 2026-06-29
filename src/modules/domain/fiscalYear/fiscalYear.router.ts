import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  closeFiscalYear,
  createFiscalYear,
  getFiscalYearById,
  listFiscalYears,
  updateFiscalYear,
} from './fiscalYear.controller.js';
import {
  createFiscalYearBodySchema,
  fiscalYearIdParamSchema,
  listFiscalYearsQuerySchema,
  updateFiscalYearBodySchema,
} from './fiscalYear.validator.js';

const fiscalYearRouter = Router();

fiscalYearRouter.post(
  '/',
  validate(createFiscalYearBodySchema, 'body'),
  createFiscalYear,
);
fiscalYearRouter.get(
  '/',
  validate(listFiscalYearsQuerySchema, 'query'),
  listFiscalYears,
);
fiscalYearRouter.get(
  '/:id',
  validate(fiscalYearIdParamSchema, 'params'),
  getFiscalYearById,
);
fiscalYearRouter.put(
  '/:id',
  validate(fiscalYearIdParamSchema, 'params'),
  validate(updateFiscalYearBodySchema, 'body'),
  updateFiscalYear,
);
fiscalYearRouter.patch(
  '/:id/close',
  validate(fiscalYearIdParamSchema, 'params'),
  closeFiscalYear,
);

export default fiscalYearRouter;
