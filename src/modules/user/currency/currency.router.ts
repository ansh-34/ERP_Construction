import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import { getCurrency, listCurrencies } from './currency.controller.js';
import {
  currencyIdParamsSchema,
  listCurrenciesQuerySchema,
} from './currency.validator.js';

const router = Router();


router.get(
  '/',
  authorize('CURRENCY', 'READ'), validate(listCurrenciesQuerySchema, 'query'), listCurrencies);
router.get(
  '/:id',
  authorize('CURRENCY', 'READ'), validate(currencyIdParamsSchema, 'params'), getCurrency);

export default router;
