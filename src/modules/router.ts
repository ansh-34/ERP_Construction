import { Router } from 'express';
import authRouter from './refreshToken/auth.router.js';
import domainRouter from './domain/router.js';
import profileRouter from './profile/profile.router.js';
import superAdminRouter from './superAdmin/router.js';
import userRouter from './user/router.js';
const router = Router();

router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/domain', domainRouter);
router.use('/superadmin', superAdminRouter);
router.use('/user', userRouter);

export default router;
