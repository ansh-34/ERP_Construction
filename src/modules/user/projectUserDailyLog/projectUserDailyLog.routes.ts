import { Router } from 'express';
import authorize from '@/middlewares/authorize';
import { validate } from '@/middlewares/validate';
import { projectUserDailyLogController } from './projectUserDailyLog.controller';
import {
  createProjectUserDailyLogBody,
  idParams,
  listProjectUserDailyLogQuery,
  updateProjectUserDailyLogBody,
} from './projectUserDailyLog.validate';

const projectUserDailyLogRouter = Router();

projectUserDailyLogRouter.post(
  '/',
  authorize('PROJECT_USER_DAILY_LOG', 'CREATE'),
  validate(createProjectUserDailyLogBody, 'body'),
  projectUserDailyLogController.create,
);
projectUserDailyLogRouter.get(
  '/',
  authorize('PROJECT_USER_DAILY_LOG', 'READ'),
  validate(listProjectUserDailyLogQuery, 'query'),
  projectUserDailyLogController.getAll,
);
projectUserDailyLogRouter.get(
  '/:id',
  authorize('PROJECT_USER_DAILY_LOG', 'READ'),
  validate(idParams, 'params'),
  projectUserDailyLogController.getById,
);
projectUserDailyLogRouter.put(
  '/:id',
  authorize('PROJECT_USER_DAILY_LOG', 'UPDATE'),
  validate(idParams, 'params'),
  validate(updateProjectUserDailyLogBody, 'body'),
  projectUserDailyLogController.update,
);
projectUserDailyLogRouter.delete(
  '/:id',
  authorize('PROJECT_USER_DAILY_LOG', 'DELETE'),
  validate(idParams, 'params'),
  projectUserDailyLogController.delete,
);

export default projectUserDailyLogRouter;
