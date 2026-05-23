import { Router } from 'express';
import { listLogs, getAnalytics } from './logs.controller.js';
import validateSuperAdmin from '@/middlewares/validateSuperAdmin.js';
import { validate } from '@/middlewares/validate.js';
import { analyticsQuerySchema } from './logs.validator.js';

const router = Router();

router.use(validateSuperAdmin);

router.get('/analytics', validate(analyticsQuerySchema, 'query'), getAnalytics);
router.get('/', listLogs);

export default router;
