import { Router } from 'express';
import { projectCategoryController } from './projectCategory.controller';
import { validate } from '@/middlewares/validate';
import {
  createProjectCategoryBody,
  domainIdQuery,
  idParams,
  updateProjectCategoryBody,
} from './projectCategory.validate';

const projectCategoryRouter = Router();

projectCategoryRouter.post(
  '/',
  validate(createProjectCategoryBody, 'body'),
  projectCategoryController.create,
);
projectCategoryRouter.get(
  '/',
  validate(domainIdQuery, 'query'),
  projectCategoryController.getAll,
);
projectCategoryRouter.get(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  projectCategoryController.getById,
);
projectCategoryRouter.put(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  validate(updateProjectCategoryBody, 'body'),
  projectCategoryController.update,
);
projectCategoryRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  projectCategoryController.delete,
);

export default projectCategoryRouter;
