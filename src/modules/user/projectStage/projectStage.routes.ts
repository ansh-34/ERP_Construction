import { Router } from 'express';
import authorize from '@/middlewares/authorize';
import { projectStageController } from './projectStage.controller';
import { validate } from '@/middlewares/validate';
import {
  createProjectStageBody,
  idParams,
  listProjectStageQuery,
  updateProjectStageBody,
} from './projectStage.validate';

const projectStageRouter = Router();

projectStageRouter.post(
  '/',
  authorize('PROJECT_STAGE', 'CREATE'),
  validate(createProjectStageBody, 'body'),
  projectStageController.create,
);
projectStageRouter.get(
  '/',
  authorize('PROJECT_STAGE', 'READ'),
  validate(listProjectStageQuery, 'query'),
  projectStageController.getAll,
);
projectStageRouter.get(
  '/:id',
  authorize('PROJECT_STAGE', 'READ'),
  validate(idParams, 'params'),
  projectStageController.getById,
);
projectStageRouter.put(
  '/:id',
  authorize('PROJECT_STAGE', 'UPDATE'),
  validate(idParams, 'params'),
  validate(updateProjectStageBody, 'body'),
  projectStageController.update,
);
projectStageRouter.delete(
  '/:id',
  authorize('PROJECT_STAGE', 'DELETE'),
  validate(idParams, 'params'),
  projectStageController.delete,
);

export default projectStageRouter;
