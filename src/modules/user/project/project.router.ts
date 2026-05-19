import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
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

router.post('/', validate(createProjectBodySchema, 'body'), createProject);
router.get('/', validate(listProjectsQuerySchema, 'query'), listDomainProjects);
router.get(
  '/my-projects',
  validate(listProjectsQuerySchema, 'query'),
  getMyProjects,
);
router.get('/:id', validate(projectIdParamsSchema, 'params'), getProjectById);
router.put(
  '/:id',
  validate(projectIdParamsSchema, 'params'),
  validate(updateProjectBodySchema, 'body'),
  updateProject,
);
router.delete('/:id', validate(projectIdParamsSchema, 'params'), deleteProject);

export default router;
