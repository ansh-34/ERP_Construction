import { Router } from 'express';
import { projectStageController } from './projectStage.controller';
import authMiddleware from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import {
  createProjectStageBody,
  domainIdQuery,
  idParams,
  listProjectStageQuery,
  updateProjectStageBody,
} from './projectStage.validate';

const projectStageRouter = Router();

projectStageRouter.use(authMiddleware);

projectStageRouter.post(
  '/',
  validate(createProjectStageBody, 'body'),
  projectStageController.create,
);
projectStageRouter.get(
  '/',
  validate(listProjectStageQuery, 'query'),
  projectStageController.getAll,
);
projectStageRouter.get(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  projectStageController.getById,
);
projectStageRouter.put(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  validate(updateProjectStageBody, 'body'),
  projectStageController.update,
);
projectStageRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  projectStageController.delete,
);

export default projectStageRouter;
