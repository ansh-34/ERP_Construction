import { Router } from 'express';
import superAdminRouter from './superAdmin/router';
import domainRouter from './domain/router';

const router = Router();

router.use('/superAdmin', superAdminRouter);
router.use('/domain', domainRouter);

export default router;
