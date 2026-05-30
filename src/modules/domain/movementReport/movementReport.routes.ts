import { Router } from 'express';
import { validate } from '@/middlewares/validate';
import { movementReportController } from './movementReport.controller';
import { movementReportQuery } from './movementReport.validate';

const movementReportRouter = Router();

movementReportRouter.get(
  '/',
  validate(movementReportQuery, 'query'),
  movementReportController.getReport,
);

export default movementReportRouter;
