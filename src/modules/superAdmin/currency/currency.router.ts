import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  createCurrency,
  listCurrencies,
  updateCurrency,
  deleteCurrency,
  getCurrency,
} from './currency.controller.js';
import {
  createCurrencyBodySchema,
  listCurrenciesQuerySchema,
  updateCurrencyBodySchema,
  currencyIdParamsSchema,
} from './currency.validator.js';
import validateSuperAdmin from '@/middlewares/validateSuperAdmin.js';

const router = Router();

router.use(validateSuperAdmin);

router.post('/', validate(createCurrencyBodySchema, 'body'), createCurrency);

router.get('/', validate(listCurrenciesQuerySchema, 'query'), listCurrencies);

router.get('/:id', validate(currencyIdParamsSchema, 'params'), getCurrency);

router.put(
  '/:id',
  validate(currencyIdParamsSchema, 'params'),
  validate(updateCurrencyBodySchema, 'body'),
  updateCurrency,
);

router.delete(
  '/:id',
  validate(currencyIdParamsSchema, 'params'),
  deleteCurrency,
);

export default router;
