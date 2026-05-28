import { Router } from 'express';

import authRouter from './auth/auth.router.js';
import languageRouter from './language/language.router.js';
import currencyRouter from './currency/currency.router.js';
import locationRouter from './location/location.routes.js';
import profileRouter from './profile/profile.router.js';
import userListRouter from './user/user.router.js';
import projectRouter from './project/project.router.js';
import projectStageRouter from './projectStage/projectStage.routes.js';
import projectUserAssignmentRouter from './projectUserAssignment/projectUserAssignment.routes.js';
import projectUserDailyLogRouter from './projectUserDailyLog/projectUserDailyLog.routes.js';
import projectTaskRouter from './projectTask/projectTask.routes.js';
import projectTaskImagesRouter from './projectTaskImages/projectTaskImages.routes.js';
import projectTaskDelayRouter from './projectTaskDelay/projectTaskDelay.routes.js';
import userTaskSubmissionRouter from './userTaskSubmission/userTaskSubmission.routes.js';
import machineryRouter from './machinery/machinery.routes.js';
import machineReadingRouter from './machineReading/machineReading.routes.js';
import grnRouter from './grn/grn.router.js';
import productRouter from './product/product.router.js';
import { vendorProductPriceRouter } from './vendorProductPrice/vendorProductPrice.router.js';
import { uomRouter } from './uom/uom.router.js';
import authMiddleware from '../../middlewares/auth.js';
import modulePermissionRouter from './modulePermission/modulePermission.router.js';
import moduleRouter from './module/module.router.js';
import inventoryRouter from './inventory/inventory.router.js';
import invoiceRouter from './invoice/invoice.router.js';
import rawMaterialPurchaseRequestRouter from './rawMaterialPurchaseRequest/rawMaterialPurchaseRequest.router.js';
import { listAllProductGrades } from './productGrade/productGrade.controller.js';
import { listAllProductGradeStdRates } from './productGradeStdRate/productGradeStdRate.controller.js';
import { validate } from '../../middlewares/validate.js';
import { z } from 'zod';
import {
  pageBasedPaginationQuerySchema,
  statusFilterSchema,
} from '../common/common.validator.js';

const listAllGradesAndRatesQuerySchema = pageBasedPaginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
    productId: z.string().uuid().optional().or(z.literal('')),
    gradeId: z.string().uuid().optional().or(z.literal('')),
    productGradeId: z.string().uuid().optional().or(z.literal('')),
  });

const userRouter = Router();

userRouter.use('/auth', authRouter);

userRouter.use(authMiddleware);
userRouter.use('/language', languageRouter);
userRouter.use('/currency', currencyRouter);
userRouter.use('/locations', locationRouter);
userRouter.use('/profile', profileRouter);
userRouter.use('/users', userListRouter);
userRouter.use('/projects', projectRouter);
userRouter.use('/project-stages', projectStageRouter);
userRouter.use('/project-user-assignments', projectUserAssignmentRouter);
userRouter.use('/project-user-daily-logs', projectUserDailyLogRouter);
userRouter.use('/project-tasks', projectTaskRouter);
userRouter.use('/project-task-images', projectTaskImagesRouter);
userRouter.use('/project-task-delays', projectTaskDelayRouter);
userRouter.use('/task-submission', userTaskSubmissionRouter);
userRouter.use('/machineries', machineryRouter);
userRouter.use('/machine-reading', machineReadingRouter);
userRouter.use('/grn', grnRouter);
userRouter.use('/products', productRouter);
userRouter.use('/vendor-product-prices', vendorProductPriceRouter());
userRouter.use('/uoms', uomRouter());
userRouter.use('/inventory', inventoryRouter);
userRouter.use('/invoices', invoiceRouter);
userRouter.use('/rmpr', rawMaterialPurchaseRequestRouter);
userRouter.use('/modules', moduleRouter);
userRouter.use('/module-permissions', modulePermissionRouter);

// New flat query APIs
userRouter.get(
  '/grades',
  validate(listAllGradesAndRatesQuerySchema, 'query'),
  listAllProductGrades,
);
userRouter.get(
  '/std-rates',
  validate(listAllGradesAndRatesQuerySchema, 'query'),
  listAllProductGradeStdRates,
);

export default userRouter;
