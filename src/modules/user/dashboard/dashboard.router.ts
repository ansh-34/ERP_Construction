import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { getDashboardAnalytics } from './dashboard.controller.js';
import { dashboardQuerySchema } from './dashboard.validator.js';
import authorize from '@/middlewares/authorize.js';
const router = Router();

router.get(
  '/',
  authorize('DASHBOARD', 'READ'),
  validate(dashboardQuerySchema, 'query'),
  getDashboardAnalytics,
);

export default router;
