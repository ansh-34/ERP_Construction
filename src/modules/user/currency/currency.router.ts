import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import { getCurrency, listCurrencies } from './currency.controller.js';
import {
  currencyIdParamsSchema,
  listCurrenciesQuerySchema,
} from './currency.validator.js';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(listCurrenciesQuerySchema, 'query'), listCurrencies);
router.get('/:id', validate(currencyIdParamsSchema, 'params'), getCurrency);

export default router;
