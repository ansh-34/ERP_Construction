import { Router } from 'express';
import authorize from '@/middlewares/authorize';
import { validate } from '@/middlewares/validate';
import { projectTaskController } from './projectTask.controller';
import {
  createProjectTaskBody,
  idParams,
  listProjectTaskQuery,
  updateProjectTaskBody,
} from './projectTask.validate';

const projectTaskRouter = Router();


projectTaskRouter.post(
  '/',
  authorize('PROJECT_TASK', 'CREATE'),
  validate(createProjectTaskBody, 'body'),
  projectTaskController.create,
);
projectTaskRouter.get(
  '/',
  authorize('PROJECT_TASK', 'READ'),
  validate(listProjectTaskQuery, 'query'),
  projectTaskController.getAll,
);
projectTaskRouter.get(
  '/:id',
  authorize('PROJECT_TASK', 'READ'),
  validate(idParams, 'params'),
  projectTaskController.getById,
);
projectTaskRouter.put(
  '/:id',
  authorize('PROJECT_TASK', 'UPDATE'),
  validate(idParams, 'params'),
  validate(updateProjectTaskBody, 'body'),
  projectTaskController.update,
);
projectTaskRouter.delete(
  '/:id',
  authorize('PROJECT_TASK', 'DELETE'),
  validate(idParams, 'params'),
  projectTaskController.delete,
);

export default projectTaskRouter;
