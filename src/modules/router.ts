import { Router } from 'express';
import domainRouter from './domain/router.js';
import superAdminRouter from './superAdmin/router.js';
import userRouter from './user/router.js';
const router = Router();

router.use('/domain', domainRouter);
router.use('/superadmin', superAdminRouter);
router.use('/user', userRouter);

export default router;
