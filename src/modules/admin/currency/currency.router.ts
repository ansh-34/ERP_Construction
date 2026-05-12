import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  listCurrencies,
  getCurrency,
  updateCurrency,
} from './currency.controller.js';
import {
  listCurrenciesQuerySchema,
  currencyIdParamsSchema,
  updateCurrencyBodySchema,
} from './currency.validator.js';
import authMiddleware from '../../../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(listCurrenciesQuerySchema, 'query'), listCurrencies);
router.get('/:id', validate(currencyIdParamsSchema, 'params'), getCurrency);
router.put(
  '/:id',
  validate(currencyIdParamsSchema, 'params'),
  validate(updateCurrencyBodySchema, 'body'),
  updateCurrency,
);

export default router;
