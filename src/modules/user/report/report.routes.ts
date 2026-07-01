import { Router } from 'express';
import { validate } from '@/middlewares/validate';
import authorize from '@/middlewares/authorize';
import { reportController } from './report.controller';
import {
  machineSummaryExportQuerySchema,
  machineSummaryQuerySchema,
  projectSummaryExportQuerySchema,
  projectSummaryQuerySchema,
  projectUserTaskExportQuerySchema,
  projectUserTaskQuerySchema,
  productInventoryExportQuerySchema,
  productInventoryQuerySchema,
  vendorPurchaseHistoryExportQuerySchema,
  vendorPurchaseHistoryQuerySchema,
  productTransactionHistoryExportQuerySchema,
  productTransactionHistoryQuerySchema,
} from './report.validator';

const reportRouter = Router();

reportRouter.get(
  '/machine-summary/export',
  authorize('REPORT', 'READ'),
  validate(machineSummaryExportQuerySchema, 'query'),
  reportController.exportMachineSummary,
);

reportRouter.get(
  '/machine-summary/summary',
  authorize('REPORT', 'READ'),
  validate(machineSummaryQuerySchema, 'query'),
  reportController.getMachineSummaryDashboard,
);

reportRouter.get(
  '/machine-summary',
  authorize('REPORT', 'READ'),
  validate(machineSummaryQuerySchema, 'query'),
  reportController.getMachineSummary,
);

reportRouter.get(
  '/project-summary/export',
  authorize('REPORT', 'READ'),
  validate(projectSummaryExportQuerySchema, 'query'),
  reportController.exportProjectSummary,
);

reportRouter.get(
  '/project-summary',
  authorize('REPORT', 'READ'),
  validate(projectSummaryQuerySchema, 'query'),
  reportController.getProjectSummary,
);

reportRouter.get(
  '/project-user-task/export',
  authorize('REPORT', 'READ'),
  validate(projectUserTaskExportQuerySchema, 'query'),
  reportController.exportProjectUserTask,
);

reportRouter.get(
  '/project-user-task/summary',
  authorize('REPORT', 'READ'),
  validate(projectUserTaskQuerySchema, 'query'),
  reportController.getProjectUserTaskSummary,
);

reportRouter.get(
  '/project-user-task',
  authorize('REPORT', 'READ'),
  validate(projectUserTaskQuerySchema, 'query'),
  reportController.getProjectUserTask,
);

reportRouter.get(
  '/product-inventory/export',
  authorize('REPORT', 'READ'),
  validate(productInventoryExportQuerySchema, 'query'),
  reportController.exportProductInventory,
);

reportRouter.get(
  '/product-inventory',
  authorize('REPORT', 'READ'),
  validate(productInventoryQuerySchema, 'query'),
  reportController.getProductInventory,
);

reportRouter.get(
  '/vendor-purchase-history/export',
  authorize('REPORT', 'READ'),
  validate(vendorPurchaseHistoryExportQuerySchema, 'query'),
  reportController.exportVendorPurchaseHistory,
);

reportRouter.get(
  '/vendor-purchase-history',
  authorize('REPORT', 'READ'),
  validate(vendorPurchaseHistoryQuerySchema, 'query'),
  reportController.getVendorPurchaseHistory,
);

reportRouter.get(
  '/product-transaction-history/export',
  authorize('REPORT', 'READ'),
  validate(productTransactionHistoryExportQuerySchema, 'query'),
  reportController.exportProductTransactionHistory,
);

reportRouter.get(
  '/product-transaction-history',
  authorize('REPORT', 'READ'),
  validate(productTransactionHistoryQuerySchema, 'query'),
  reportController.getProductTransactionHistory,
);

export default reportRouter;
