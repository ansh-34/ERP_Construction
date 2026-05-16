import { Router } from 'express';
import { projectController } from './project.controller';
import authMiddleware from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import {
  createProjectBody,
  domainIdQuery,
  idParams,
  updateProjectBody,
} from './project.validate';

const projectRouter = Router();

projectRouter.use(authMiddleware);

projectRouter.post(
  '/',
  validate(createProjectBody, 'body'),
  projectController.create,
);
projectRouter.get(
  '/',
  validate(domainIdQuery, 'query'),
  projectController.getAll,
);
projectRouter.get(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  projectController.getById,
);
projectRouter.put(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  validate(updateProjectBody, 'body'),
  projectController.update,
);
projectRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  projectController.delete,
);

export default projectRouter;
