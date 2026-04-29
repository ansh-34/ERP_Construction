import { Router } from 'express';
import domainRouter from './domain/router.js';
import superAdminRouter from './superAdmin/router.js';

const router = Router();

router.use(domainRouter);
router.use(superAdminRouter);

export default router;
