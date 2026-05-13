import { Router } from 'express';

import authRouter from './auth/auth.router.js';
import profileRouter from './profile/profile.router.js';
import projectRouter from './project/project.router.js';

const userRouter = Router();

userRouter.use('/auth', authRouter);
userRouter.use('/profile', profileRouter);
userRouter.use('/projects', projectRouter);

export default userRouter;
