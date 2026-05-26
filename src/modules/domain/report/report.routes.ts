import { Router } from 'express';
import { validate } from '@/middlewares/validate';
import { reportController } from './report.controller';
import { reportExportQuerySchema, reportQuerySchema } from './report.validator';

const reportRouter = Router();

reportRouter.get(
  '/export',
  validate(reportExportQuerySchema, 'query'),
  reportController.exportReport,
);

reportRouter.get(
  '/',
  validate(reportQuerySchema, 'query'),
  reportController.getReport,
);

export default reportRouter;
