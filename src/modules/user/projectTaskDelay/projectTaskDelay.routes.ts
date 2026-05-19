import { Router } from 'express';
import authorize from '@/middlewares/authorize';
import { validate } from '@/middlewares/validate';
import { projectTaskDelayController } from './projectTaskDelay.controller';
import {
  createProjectTaskDelayBody,
  idParams,
  listProjectTaskDelayQuery,
  updateProjectTaskDelayBody,
} from './projectTaskDelay.validate';

const projectTaskDelayRouter = Router();

projectTaskDelayRouter.post(
  '/',
  authorize('PROJECT_TASK_DELAY', 'CREATE'),
  validate(createProjectTaskDelayBody, 'body'),
  projectTaskDelayController.create,
);
projectTaskDelayRouter.get(
  '/',
  authorize('PROJECT_TASK_DELAY', 'READ'),
  validate(listProjectTaskDelayQuery, 'query'),
  projectTaskDelayController.getAll,
);
projectTaskDelayRouter.get(
  '/:id',
  authorize('PROJECT_TASK_DELAY', 'READ'),
  validate(idParams, 'params'),
  projectTaskDelayController.getById,
);
projectTaskDelayRouter.put(
  '/:id',
  authorize('PROJECT_TASK_DELAY', 'UPDATE'),
  validate(idParams, 'params'),
  validate(updateProjectTaskDelayBody, 'body'),
  projectTaskDelayController.update,
);
projectTaskDelayRouter.delete(
  '/:id',
  authorize('PROJECT_TASK_DELAY', 'DELETE'),
  validate(idParams, 'params'),
  projectTaskDelayController.delete,
);

export default projectTaskDelayRouter;
