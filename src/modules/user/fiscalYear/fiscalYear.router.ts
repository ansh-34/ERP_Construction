import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createFiscalYear,
  getFiscalYearById,
  listFiscalYears,
  updateFiscalYear,
} from '../../domain/fiscalYear/fiscalYear.controller.js';
import {
  createFiscalYearBodySchema,
  fiscalYearIdParamSchema,
  listFiscalYearsQuerySchema,
  updateFiscalYearBodySchema,
} from '../../domain/fiscalYear/fiscalYear.validator.js';
import { closeFiscalYearAsUser } from './fiscalYear.controller.js';

const router = Router();

router.post(
  '/',
  authorize('FISCAL_YEAR', 'CREATE'),
  validate(createFiscalYearBodySchema, 'body'),
  createFiscalYear,
);
router.get(
  '/',
  authorize('FISCAL_YEAR', 'READ'),
  validate(listFiscalYearsQuerySchema, 'query'),
  listFiscalYears,
);
router.get(
  '/:id',
  authorize('FISCAL_YEAR', 'READ'),
  validate(fiscalYearIdParamSchema, 'params'),
  getFiscalYearById,
);
router.put(
  '/:id',
  authorize('FISCAL_YEAR', 'UPDATE'),
  validate(fiscalYearIdParamSchema, 'params'),
  validate(updateFiscalYearBodySchema, 'body'),
  updateFiscalYear,
);
router.patch(
  '/:id/close',
  authorize('FISCAL_YEAR', 'CLOSE'),
  validate(fiscalYearIdParamSchema, 'params'),
  closeFiscalYearAsUser,
);

export default router;
