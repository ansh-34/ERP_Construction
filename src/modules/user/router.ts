import { Router } from 'express';

import authRouter from './auth/auth.router.js';
import languageRouter from './language/language.router.js';
import currencyRouter from './currency/currency.router.js';
import locationRouter from './location/location.routes.js';
import profileRouter from './profile/profile.router.js';
import projectRouter from './project/project.router.js';
import projectStageRouter from './projectStage/projectStage.routes.js';
import projectUserAssignmentRouter from './projectUserAssignment/projectUserAssignment.routes.js';
import projectUserDailyLogRouter from './projectUserDailyLog/projectUserDailyLog.routes.js';
import projectTaskRouter from './projectTask/projectTask.routes.js';
import projectTaskImagesRouter from './projectTaskImages/projectTaskImages.routes.js';
import projectTaskDelayRouter from './projectTaskDelay/projectTaskDelay.routes.js';
import userTaskSubmissionRouter from './userTaskSubmission/userTaskSubmission.routes.js';
import grnRouter from './grn/grn.router.js';
import productRouter from './product/product.router.js';
import { vendorProductPriceRouter } from './vendorProductPrice/vendorProductPrice.router.js';
import { uomRouter } from './uom/uom.router.js';
import authMiddleware from '../../middlewares/auth.js';
import modulePermissionRouter from './modulePermission/modulePermission.router.js';
import moduleRouter from './module/module.router.js';

const userRouter = Router();

userRouter.use('/auth', authRouter);

userRouter.use(authMiddleware);
userRouter.use('/language', languageRouter);
userRouter.use('/currency', currencyRouter);
userRouter.use('/locations', locationRouter);
userRouter.use('/profile', profileRouter);
userRouter.use('/projects', projectRouter);
userRouter.use('/project-stages', projectStageRouter);
userRouter.use('/project-user-assignments', projectUserAssignmentRouter);
userRouter.use('/project-user-daily-logs', projectUserDailyLogRouter);
userRouter.use('/project-tasks', projectTaskRouter);
userRouter.use('/project-task-images', projectTaskImagesRouter);
userRouter.use('/project-task-delays', projectTaskDelayRouter);
userRouter.use('/task-submission', userTaskSubmissionRouter);
userRouter.use('/grn', grnRouter);
userRouter.use('/products', productRouter);
userRouter.use('/vendor-product-prices', vendorProductPriceRouter());
userRouter.use('/uoms', uomRouter());
userRouter.use('/modules', moduleRouter);
userRouter.use('/module-permissions', modulePermissionRouter);

export default userRouter;
