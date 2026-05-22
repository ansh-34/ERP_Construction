import { Router } from 'express';
import authorize from '@/middlewares/authorize';
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
  authorize('PROJECT_USER_ASSIGNMENT', 'CREATE'),
  validate(createProjectUserAssignmentBody, 'body'),
  projectUserAssignmentController.create,
);
projectUserAssignmentRouter.get(
  '/',
  authorize('PROJECT_USER_ASSIGNMENT', 'READ'),
  validate(listProjectUserAssignmentQuery, 'query'),
  projectUserAssignmentController.getAll,
);
projectUserAssignmentRouter.get(
  '/:id',
  authorize('PROJECT_USER_ASSIGNMENT', 'READ'),
  validate(idParams, 'params'),
  projectUserAssignmentController.getById,
);
projectUserAssignmentRouter.put(
  '/:id',
  authorize('PROJECT_USER_ASSIGNMENT', 'UPDATE'),
  validate(idParams, 'params'),
  validate(updateProjectUserAssignmentBody, 'body'),
  projectUserAssignmentController.update,
);
projectUserAssignmentRouter.delete(
  '/:id',
  authorize('PROJECT_USER_ASSIGNMENT', 'DELETE'),
  validate(idParams, 'params'),
  projectUserAssignmentController.delete,
);

export default projectUserAssignmentRouter;
