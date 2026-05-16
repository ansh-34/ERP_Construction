import { Router } from 'express';
import authMiddleware from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { projectTaskDelayController } from './projectTaskDelay.controller';
import {
  createProjectTaskDelayBody,
  domainIdQuery,
  idParams,
  listProjectTaskDelayQuery,
  updateProjectTaskDelayBody,
} from './projectTaskDelay.validate';

const projectTaskDelayRouter = Router();

projectTaskDelayRouter.use(authMiddleware);

projectTaskDelayRouter.post(
  '/',
  validate(createProjectTaskDelayBody, 'body'),
  projectTaskDelayController.create,
);
projectTaskDelayRouter.get(
  '/',
  validate(listProjectTaskDelayQuery, 'query'),
  projectTaskDelayController.getAll,
);
projectTaskDelayRouter.get(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  projectTaskDelayController.getById,
);
projectTaskDelayRouter.put(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  validate(updateProjectTaskDelayBody, 'body'),
  projectTaskDelayController.update,
);
projectTaskDelayRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  projectTaskDelayController.delete,
);

export default projectTaskDelayRouter;
