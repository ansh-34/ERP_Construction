import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { getDashboardAnalytics } from './dashboard.controller.js';
import { dashboardQuerySchema } from './dashboard.validator.js';

const router = Router();

router.get('/', validate(dashboardQuerySchema, 'query'), getDashboardAnalytics);

export default router;
