import { Router } from 'express';
import { projectController } from './project.controller';
import { validate } from '@/middlewares/validate';
import {
  createProjectBody,
  domainIdQuery,
  idParams,
  listProjectTaskSubmissionQuery,
  projectTaskDelayActionBody,
  projectTaskSubmissionActionBody,
  submitProjectTaskBody,
  updateProjectBody,
} from './project.validate';

const projectRouter = Router();

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
projectRouter.get('/analytics', projectController.getAnalytics);
projectRouter.post(
  '/tasks/submission',
  validate(submitProjectTaskBody, 'body'),
  projectController.submitTask,
);
projectRouter.get(
  '/tasks/submission',
  validate(listProjectTaskSubmissionQuery, 'query'),
  projectController.getTaskSubmissions,
);
projectRouter.put(
  '/tasks/submission/action',
  validate(projectTaskSubmissionActionBody, 'body'),
  projectController.actionTaskSubmission,
);
projectRouter.put(
  '/tasks/delay/action',
  validate(projectTaskDelayActionBody, 'body'),
  projectController.actionTaskDelay,
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
