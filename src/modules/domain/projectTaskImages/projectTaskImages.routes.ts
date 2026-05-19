import { Router } from 'express';
import authMiddleware from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { projectTaskImagesController } from './projectTaskImages.controller';
import {
  createProjectTaskImageBody,
  domainIdQuery,
  idParams,
  listProjectTaskImageQuery,
} from './projectTaskImages.validate';

const projectTaskImagesRouter = Router();

projectTaskImagesRouter.use(authMiddleware);

projectTaskImagesRouter.post(
  '/',
  validate(createProjectTaskImageBody, 'body'),
  projectTaskImagesController.create,
);

projectTaskImagesRouter.get(
  '/',
  validate(listProjectTaskImageQuery, 'query'),
  projectTaskImagesController.getAll,
);

projectTaskImagesRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  projectTaskImagesController.delete,
);

export default projectTaskImagesRouter;
