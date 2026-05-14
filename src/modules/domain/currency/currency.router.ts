import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { listCurrencies, getCurrency } from './currency.controller.js';
import {
  listCurrenciesQuerySchema,
  currencyIdParamsSchema,
} from './currency.validator.js';
import authMiddleware from '../../../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(listCurrenciesQuerySchema, 'query'), listCurrencies);

router.get('/:id', validate(currencyIdParamsSchema, 'params'), getCurrency);

export default router;
