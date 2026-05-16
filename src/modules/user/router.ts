import { Router } from 'express';

import authRouter from './auth/auth.router.js';
import profileRouter from './profile/profile.router.js';
import projectRouter from './project/project.router.js';
import projectStageRouter from './projectStage/projectStage.routes.js';
import projectTaskRouter from './projectTask/projectTask.routes.js';
import projectTaskDelayRouter from './projectTaskDelay/projectTaskDelay.routes.js';
const userRouter = Router();

userRouter.use('/auth', authRouter);
userRouter.use('/profile', profileRouter);
userRouter.use('/projects', projectRouter);
userRouter.use('/project-stages', projectStageRouter);
userRouter.use('/project-tasks', projectTaskRouter);
userRouter.use('/project-task-delays', projectTaskDelayRouter);

export default userRouter;
