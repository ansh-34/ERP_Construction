import { Router } from 'express';
import authMiddleware from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { projectTaskController } from './projectTask.controller';
import {
  createProjectTaskBody,
  domainIdQuery,
  idParams,
  listProjectTaskQuery,
  updateProjectTaskBody,
} from './projectTask.validate';

const projectTaskRouter = Router();

projectTaskRouter.use(authMiddleware);

projectTaskRouter.post(
  '/',
  validate(createProjectTaskBody, 'body'),
  projectTaskController.create,
);
projectTaskRouter.get(
  '/',
  validate(listProjectTaskQuery, 'query'),
  projectTaskController.getAll,
);
projectTaskRouter.get(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  projectTaskController.getById,
);
projectTaskRouter.put(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  validate(updateProjectTaskBody, 'body'),
  projectTaskController.update,
);
projectTaskRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  projectTaskController.delete,
);

export default projectTaskRouter;
