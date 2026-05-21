import { Router } from 'express';
import authorize from '@/middlewares/authorize';
import { validate } from '@/middlewares/validate';
import { projectTaskImagesController } from './projectTaskImages.controller';
import {
  createProjectTaskImageBody,
  idParams,
  listProjectTaskImageQuery,
} from './projectTaskImages.validate';

const projectTaskImagesRouter = Router();

projectTaskImagesRouter.post(
  '/',
  authorize('PROJECT_TASK_IMAGE', 'CREATE'),
  validate(createProjectTaskImageBody, 'body'),
  projectTaskImagesController.create,
);

projectTaskImagesRouter.get(
  '/',
  authorize('PROJECT_TASK_IMAGE', 'READ'),
  validate(listProjectTaskImageQuery, 'query'),
  projectTaskImagesController.getAll,
);

projectTaskImagesRouter.delete(
  '/:id',
  authorize('PROJECT_TASK_IMAGE', 'DELETE'),
  validate(idParams, 'params'),
  projectTaskImagesController.delete,
);

export default projectTaskImagesRouter;
