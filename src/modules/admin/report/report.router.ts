import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import authMiddleware from '../../../middlewares/auth.js';
import { adminReportController } from './report.controller.js';
import {
  projectSummaryQuerySchema,
  projectSummaryExportQuerySchema,
  projectUserTaskQuerySchema,
  projectUserTaskExportQuerySchema,
  machineSummaryQuerySchema,
  machineSummaryExportQuerySchema,
  productInventoryQuerySchema,
  vendorPurchaseHistoryQuerySchema,
  productTransactionHistoryQuerySchema,
} from './report.validator.js';

const router = Router();

router.use(authMiddleware);

router.get(
  '/domains',
  validate(projectSummaryQuerySchema, 'query'),
  adminReportController.listAccessibleDomains,
);

router.get(
  '/machine-summary/export',
  validate(machineSummaryExportQuerySchema, 'query'),
  adminReportController.exportMachineSummary,
);

router.get(
  '/machine-summary/summary',
  validate(machineSummaryQuerySchema, 'query'),
  adminReportController.getMachineSummaryDashboard,
);

router.get(
  '/machine-summary',
  validate(machineSummaryQuerySchema, 'query'),
  adminReportController.getMachineSummary,
);

router.get(
  '/project-summary/export',
  validate(projectSummaryExportQuerySchema, 'query'),
  adminReportController.exportProjectSummary,
);

router.get(
  '/project-summary',
  validate(projectSummaryQuerySchema, 'query'),
  adminReportController.getProjectSummary,
);

router.get(
  '/project-user-task/export',
  validate(projectUserTaskExportQuerySchema, 'query'),
  adminReportController.exportProjectUserTask,
);

router.get(
  '/project-user-task/summary',
  validate(projectUserTaskQuerySchema, 'query'),
  adminReportController.getProjectUserTaskSummary,
);

router.get(
  '/project-user-task',
  validate(projectUserTaskQuerySchema, 'query'),
  adminReportController.getProjectUserTask,
);

router.get(
  '/product-inventory/export',
  validate(productInventoryQuerySchema, 'query'),
  adminReportController.exportProductInventory,
);

router.get(
  '/product-inventory',
  validate(productInventoryQuerySchema, 'query'),
  adminReportController.getProductInventory,
);

router.get(
  '/vendor-purchase-history/export',
  validate(vendorPurchaseHistoryQuerySchema, 'query'),
  adminReportController.exportVendorPurchaseHistory,
);

router.get(
  '/vendor-purchase-history',
  validate(vendorPurchaseHistoryQuerySchema, 'query'),
  adminReportController.getVendorPurchaseHistory,
);

router.get(
  '/product-transaction-history/export',
  validate(productTransactionHistoryQuerySchema, 'query'),
  adminReportController.exportProductTransactionHistory,
);

router.get(
  '/product-transaction-history',
  validate(productTransactionHistoryQuerySchema, 'query'),
  adminReportController.getProductTransactionHistory,
);

export default router;
