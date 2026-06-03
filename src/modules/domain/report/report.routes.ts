import { Router } from 'express';
import { validate } from '@/middlewares/validate';
import { reportController } from './report.controller';
import {
  projectSummaryExportQuerySchema,
  projectSummaryQuerySchema,
  projectUserTaskExportQuerySchema,
  projectUserTaskQuerySchema,
} from './report.validator';

const reportRouter = Router();

reportRouter.get(
  '/project-summary/export',
  validate(projectSummaryExportQuerySchema, 'query'),
  reportController.exportProjectSummary,
);

reportRouter.get(
  '/project-summary',
  validate(projectSummaryQuerySchema, 'query'),
  reportController.getProjectSummary,
);

reportRouter.get(
  '/project-user-task/export',
  validate(projectUserTaskExportQuerySchema, 'query'),
  reportController.exportProjectUserTask,
);

reportRouter.get(
  '/project-user-task',
  validate(projectUserTaskQuerySchema, 'query'),
  reportController.getProjectUserTask,
);

export default reportRouter;
