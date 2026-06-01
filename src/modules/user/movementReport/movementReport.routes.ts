import { Router } from 'express';
import authorize from '@/middlewares/authorize';
import { validate } from '@/middlewares/validate';
import { movementReportController } from './movementReport.controller';
import { movementReportQuery } from './movementReport.validate';

const router = Router();

router.get(
  '/',
  authorize('MOVEMENT_LOG', 'READ'),
  validate(movementReportQuery, 'query'),
  movementReportController.getReport,
);

export default router;
