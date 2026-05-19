import { Router } from 'express';

import authRouter from './auth/auth.router.js';
import languageRouter from './language/language.router.js';
import currencyRouter from './currency/currency.router.js';
import profileRouter from './profile/profile.router.js';
import projectRouter from './project/project.router.js';
import projectStageRouter from './projectStage/projectStage.routes.js';
import projectTaskRouter from './projectTask/projectTask.routes.js';
import projectTaskDelayRouter from './projectTaskDelay/projectTaskDelay.routes.js';
import grnRouter from './grn/grn.router.js';
import authMiddleware from '../../middlewares/auth.js';

const userRouter = Router();

userRouter.use('/auth', authRouter);

userRouter.use(authMiddleware);
userRouter.use('/language', languageRouter);
userRouter.use('/currency', currencyRouter);
userRouter.use('/profile', profileRouter);
userRouter.use('/projects', projectRouter);
userRouter.use('/project-stages', projectStageRouter);
userRouter.use('/project-tasks', projectTaskRouter);
userRouter.use('/project-task-delays', projectTaskDelayRouter);
userRouter.use('/grn', grnRouter);

export default userRouter;
