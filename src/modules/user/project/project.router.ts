import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createProject,
  listDomainProjects,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from './project.controller.js';
import {
  createProjectBodySchema,
  listProjectsQuerySchema,
  projectIdParamsSchema,
  updateProjectBodySchema,
} from './project.validator.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  authorize('PROJECT', 'CREATE'),
  validate(createProjectBodySchema, 'body'),
  createProject,
);
router.get(
  '/',
  authorize('PROJECT', 'READ'),
  validate(listProjectsQuerySchema, 'query'),
  listDomainProjects,
);
router.get(
  '/my-projects',
  authorize('PROJECT', 'READ'),
  validate(listProjectsQuerySchema, 'query'),
  getMyProjects,
);
router.get(
  '/:id',
  authorize('PROJECT', 'READ'),
  validate(projectIdParamsSchema, 'params'),
  getProjectById,
);
router.put(
  '/:id',
  authorize('PROJECT', 'UPDATE'),
  validate(projectIdParamsSchema, 'params'),
  validate(updateProjectBodySchema, 'body'),
  updateProject,
);
router.delete(
  '/:id',
  authorize('PROJECT', 'DELETE'),
  validate(projectIdParamsSchema, 'params'),
  deleteProject,
);

export default router;
