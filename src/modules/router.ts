import { Router } from 'express';
import authRouter from './refreshToken/auth.router.js';
import domainRouter from './domain/router.js';
import superAdminRouter from './superAdmin/router.js';
import userRouter from './user/router.js';
const router = Router();

router.use('/auth', authRouter);
router.use('/domain', domainRouter);
router.use('/superAdmin', superAdminRouter);
router.use('/user', userRouter);

export default router;
