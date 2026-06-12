import { Prisma } from '@infra/database/prisma/generated/prisma/client/client.js';
import prisma from '../infra/database/prisma/prisma.client.js';

export const ReportRepository = {
  findProjects<T extends Prisma.ProjectFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.ProjectFindManyArgs>,
  ) {
    return prisma.project.findMany(args);
  },

  findProjectTaskDelays<T extends Prisma.ProjectTaskDelayFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.ProjectTaskDelayFindManyArgs>,
  ) {
    return prisma.projectTaskDelay.findMany(args);
  },

  findUsers<T extends Prisma.UserFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.UserFindManyArgs>,
  ) {
    return prisma.user.findMany(args);
  },

  findMachineries<T extends Prisma.MachineryFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.MachineryFindManyArgs>,
  ) {
    return prisma.machinery.findMany(args);
  },

  findMachineReadings<T extends Prisma.MachineReadingFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.MachineReadingFindManyArgs>,
  ) {
    return prisma.machineReading.findMany(args);
  },

  groupMachineReadings(args: any): Promise<any> {
    return prisma.machineReading.groupBy(args) as Promise<any>;
  },

  groupMaintenanceLogs(args: any): Promise<any> {
    return prisma.maintenanceLog.groupBy(args) as Promise<any>;
  },

  groupMovementLogs(args: any): Promise<any> {
    return prisma.movementLog.groupBy(args) as Promise<any>;
  },

  findMaintenanceSchedules<T extends Prisma.MaintenanceScheduleFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.MaintenanceScheduleFindManyArgs>,
  ) {
    return prisma.maintenanceSchedule.findMany(args);
  },

  findVehicles<T extends Prisma.VehicleFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.VehicleFindManyArgs>,
  ) {
    return prisma.vehicle.findMany(args);
  },

  findMaintenanceLogs<T extends Prisma.MaintenanceLogFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.MaintenanceLogFindManyArgs>,
  ) {
    return prisma.maintenanceLog.findMany(args);
  },

  findMovementLogs<T extends Prisma.MovementLogFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.MovementLogFindManyArgs>,
  ) {
    return prisma.movementLog.findMany(args);
  },

  findUoms<T extends Prisma.UomFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.UomFindManyArgs>,
  ) {
    return prisma.uom.findMany(args);
  },

  findProducts<T extends Prisma.ProductFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.ProductFindManyArgs>,
  ) {
    return prisma.product.findMany(args);
  },

  findVendors<T extends Prisma.VendorFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.VendorFindManyArgs>,
  ) {
    return prisma.vendor.findMany(args);
  },

  findInvoices<T extends Prisma.InvoiceFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.InvoiceFindManyArgs>,
  ) {
    return prisma.invoice.findMany(args);
  },

  findGrns<T extends Prisma.GrnFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.GrnFindManyArgs>,
  ) {
    return prisma.grn.findMany(args);
  },

  findPaymentRequests<T extends Prisma.PaymentRequestFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.PaymentRequestFindManyArgs>,
  ) {
    return prisma.paymentRequest.findMany(args);
  },

  findRawMaterialPurchaseRequests<
    T extends Prisma.RawMaterialPurchaseRequestFindManyArgs,
  >(
    args?: Prisma.SelectSubset<
      T,
      Prisma.RawMaterialPurchaseRequestFindManyArgs
    >,
  ) {
    return prisma.rawMaterialPurchaseRequest.findMany(args);
  },

  findInvoiceItems<T extends Prisma.InvoiceItemFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.InvoiceItemFindManyArgs>,
  ) {
    return prisma.invoiceItem.findMany(args);
  },

  findGrnProducts<T extends Prisma.GrnProductFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.GrnProductFindManyArgs>,
  ) {
    return prisma.grnProduct.findMany(args);
  },
};
