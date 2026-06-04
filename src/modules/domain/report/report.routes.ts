import { Router } from 'express';
import { validate } from '@/middlewares/validate';
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
  validate(machineSummaryExportQuerySchema, 'query'),
  reportController.exportMachineSummary,
);

reportRouter.get(
  '/machine-summary',
  validate(machineSummaryQuerySchema, 'query'),
  reportController.getMachineSummary,
);

reportRouter.get(
  '/project-summary/export',
  validate(projectSummaryExportQuerySchema, 'query'),
  reportController.exportProjectSummary,
);

reportRouter.get(
  '/project-summary',
  validate(projectSummaryQuerySchema, 'query'),
  reportController.getProjectSummary,
);

reportRouter.get(
  '/project-user-task/export',
  validate(projectUserTaskExportQuerySchema, 'query'),
  reportController.exportProjectUserTask,
);

reportRouter.get(
  '/project-user-task',
  validate(projectUserTaskQuerySchema, 'query'),
  reportController.getProjectUserTask,
);

reportRouter.get(
  '/product-inventory/export',
  validate(productInventoryExportQuerySchema, 'query'),
  reportController.exportProductInventory,
);

reportRouter.get(
  '/product-inventory',
  validate(productInventoryQuerySchema, 'query'),
  reportController.getProductInventory,
);

reportRouter.get(
  '/vendor-purchase-history/export',
  validate(vendorPurchaseHistoryExportQuerySchema, 'query'),
  reportController.exportVendorPurchaseHistory,
);

reportRouter.get(
  '/vendor-purchase-history',
  validate(vendorPurchaseHistoryQuerySchema, 'query'),
  reportController.getVendorPurchaseHistory,
);

reportRouter.get(
  '/product-transaction-history/export',
  validate(productTransactionHistoryExportQuerySchema, 'query'),
  reportController.exportProductTransactionHistory,
);

reportRouter.get(
  '/product-transaction-history',
  validate(productTransactionHistoryQuerySchema, 'query'),
  reportController.getProductTransactionHistory,
);

export default reportRouter;
