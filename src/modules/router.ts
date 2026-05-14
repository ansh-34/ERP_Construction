import { Router } from 'express';
import domainRouter from './domain/router.js';
import superAdminRouter from './superAdmin/router.js';
import userRouter from './user/router.js';
import publicRouter from './public/router.js';
import adminRouter from './admin/router.js';

const router = Router();

router.use('/admin', adminRouter);
router.use('/domain', domainRouter);
router.use('/superadmin', superAdminRouter);
router.use('/user', userRouter);
router.use('/public', publicRouter);

export default router;
