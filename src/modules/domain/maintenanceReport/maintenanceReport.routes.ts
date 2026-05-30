import { Router } from 'express';
import { validate } from '@/middlewares/validate';
import { maintenanceReportController } from './maintenanceReport.controller';
import { maintenanceReportQuery } from './maintenanceReport.validate';

const maintenanceReportRouter = Router();

maintenanceReportRouter.get(
  '/',
  validate(maintenanceReportQuery, 'query'),
  maintenanceReportController.getReport,
);

export default maintenanceReportRouter;
