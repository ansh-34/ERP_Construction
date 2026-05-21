import { Router } from 'express';
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
  validate(createProjectUserDailyLogBody, 'body'),
  projectUserDailyLogController.create,
);
projectUserDailyLogRouter.get(
  '/',
  validate(listProjectUserDailyLogQuery, 'query'),
  projectUserDailyLogController.getAll,
);
projectUserDailyLogRouter.get(
  '/:id',
  validate(idParams, 'params'),
  projectUserDailyLogController.getById,
);
projectUserDailyLogRouter.put(
  '/:id',
  validate(idParams, 'params'),
  validate(updateProjectUserDailyLogBody, 'body'),
  projectUserDailyLogController.update,
);
projectUserDailyLogRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  projectUserDailyLogController.delete,
);

export default projectUserDailyLogRouter;
