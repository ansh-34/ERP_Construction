import { Router } from 'express';
import superAdminRouter from './superAdmin/router';
import domainRouter from './domain/router';
import {
  apiKeyRouter,
  locationRouter,
  mediaRouter,
  projectRouter,
  projectCategoryRouter,
  projectStageRouter,
} from '@/routes';

const router = Router();

router.use('/superAdmin', superAdminRouter);
router.use('/domain', domainRouter);
router.use('/api-keys', apiKeyRouter);
router.use('/media', mediaRouter);
router.use('/locations', locationRouter);
router.use('/project-categories', projectCategoryRouter);
router.use('/projects', projectRouter);
router.use('/project-stages', projectStageRouter);

export default router;
