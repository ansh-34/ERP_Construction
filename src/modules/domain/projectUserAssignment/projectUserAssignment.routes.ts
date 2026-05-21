import { Router } from 'express';
import { validate } from '@/middlewares/validate';
import { projectUserAssignmentController } from './projectUserAssignment.controller';
import {
  createProjectUserAssignmentBody,
  idParams,
  listProjectUserAssignmentQuery,
  updateProjectUserAssignmentBody,
} from './projectUserAssignment.validate';

const projectUserAssignmentRouter = Router();

projectUserAssignmentRouter.post(
  '/',
  validate(createProjectUserAssignmentBody, 'body'),
  projectUserAssignmentController.create,
);
projectUserAssignmentRouter.get(
  '/',
  validate(listProjectUserAssignmentQuery, 'query'),
  projectUserAssignmentController.getAll,
);
projectUserAssignmentRouter.get(
  '/:id',
  validate(idParams, 'params'),
  projectUserAssignmentController.getById,
);
projectUserAssignmentRouter.put(
  '/:id',
  validate(idParams, 'params'),
  validate(updateProjectUserAssignmentBody, 'body'),
  projectUserAssignmentController.update,
);
projectUserAssignmentRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  projectUserAssignmentController.delete,
);

export default projectUserAssignmentRouter;
