import { Router } from 'express';
import apiKeyRouter from './apiKey/apiKey.routes';
import machineReadingRouter from './machineReading/machineReading.routes';
import locationRouter from './location/location.routes';
import machineryRouter from './machinery/machinery.routes';
import mediaRouter from './media/media.routes';
import projectRouter from './project/project.routes';
import projectStageRouter from './projectStage/projectStage.routes';
import projectTaskDelayRouter from './projectTaskDelay/projectTaskDelay.routes';
import projectTaskImagesRouter from './projectTaskImages/projectTaskImages.routes';
import projectTaskRouter from './projectTask/projectTask.routes';
import projectUserAssignmentRouter from './projectUserAssignment/projectUserAssignment.routes';
import projectUserDailyLogRouter from './projectUserDailyLog/projectUserDailyLog.routes';
import appErrorRouter from './appError/appError.router.js';
import authRouter from './auth/auth.router.js';
import dispatchRouter from './dispatch/dispatch.router.js';
import inventoryRouter from './inventory/inventory.router.js';
import journeyScheduleRouter from './journeySchedule/journeySchedule.router.js';
import roleRouter from './role/role.router.js';
import userRouter from './user/user.router.js';
import vehicleRouter from './vehicle/vehicle.router.js';
import productRouter from './product/product.router.js';
import { uomRouter } from './uom/uom.router.js';
import profileRouter from './profile/profile.router.js';
import languageRouter from './language/language.router.js';
import currencyRouter from './currency/currency.router.js';
import rawMaterialPurchaseRequestRouter from './rawMaterialPurchaseRequest/rawMaterialPurchaseRequest.router.js';
import projectUserRoleRouter from './projectUserRole/projectUserRole.router.js';
import grnRouter from './grn/grn.router.js';
import { vendorProductPriceRouter } from './vendorProductPrice/vendorProductPrice.router.js';
import invoiceRouter from './invoice/invoice.router.js';
import reportRouter from './report/report.routes';
import authMiddleware from '../../middlewares/auth.js';
import isDomain from '../../middlewares/isDomain.js';
import moduleRouter from './module/module.router';
import modulePermissionRouter from './modulePermission/modulePermission.router';
import { listAllDomainProductGrades } from './productGrade/productGrade.controller.js';
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

const domainRouter = Router();

// Routes that don't need domain auth globally
domainRouter.use('/auth', authRouter);

// isDomain routes
domainRouter.use(authMiddleware);
domainRouter.use(isDomain);

domainRouter.use('/api-keys', apiKeyRouter);
domainRouter.use('/media', mediaRouter);
domainRouter.use('/machineries', machineryRouter);
domainRouter.use('/machine-reading', machineReadingRouter);
domainRouter.use('/locations', locationRouter);
domainRouter.use('/projects', projectRouter);
domainRouter.use('/project-stages', projectStageRouter);
domainRouter.use('/project-tasks', projectTaskRouter);
domainRouter.use('/project-task-images', projectTaskImagesRouter);
domainRouter.use('/project-task-delays', projectTaskDelayRouter);
domainRouter.use('/project-user-assignments', projectUserAssignmentRouter);
domainRouter.use('/project-user-daily-logs', projectUserDailyLogRouter);
domainRouter.use('/profile', profileRouter);
domainRouter.use('/roles', roleRouter);
domainRouter.use('/users', userRouter);
domainRouter.use('/inventory', inventoryRouter);
domainRouter.use('/app-errors', appErrorRouter);
domainRouter.use('/vehicles', vehicleRouter);
domainRouter.use('/journey-schedules', journeyScheduleRouter);
domainRouter.use('/dispatch', dispatchRouter);
domainRouter.use('/products', productRouter);
domainRouter.use('/uoms', uomRouter());
domainRouter.use('/language', languageRouter);
domainRouter.use('/currency', currencyRouter);
domainRouter.use('/rmpr', rawMaterialPurchaseRequestRouter);
domainRouter.use('/project-user-roles', projectUserRoleRouter);
domainRouter.use('/grn', grnRouter);
domainRouter.use('/vendor-product-prices', vendorProductPriceRouter());
domainRouter.use('/invoices', invoiceRouter);
domainRouter.use('/report', reportRouter);
domainRouter.use('/modules', moduleRouter);
domainRouter.use('/module-permissions', modulePermissionRouter);

// New flat query APIs
domainRouter.get(
  '/grades',
  validate(listAllGradesAndRatesQuerySchema, 'query'),
  listAllDomainProductGrades,
);
domainRouter.get(
  '/std-rates',
  validate(listAllGradesAndRatesQuerySchema, 'query'),
  listAllProductGradeStdRates,
);

export default domainRouter;
