import { Router } from 'express';
import authorize from '@/middlewares/authorize';
import { validate } from '@/middlewares/validate';
import { maintenanceReportController } from './maintenanceReport.controller';
import { maintenanceReportQuery } from './maintenanceReport.validate';

const router = Router();

router.get(
  '/',
  authorize('MAINTENANCE_LOG', 'READ'),
  validate(maintenanceReportQuery, 'query'),
  maintenanceReportController.getReport,
);

export default router;
