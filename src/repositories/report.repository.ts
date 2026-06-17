import { Prisma } from '@infra/database/prisma/generated/prisma/client/client.js';
import prisma from '../infra/database/prisma/prisma.client.js';
import { StatusEnum } from '@constants/index';
import { projectProgressSql } from './project.repository.js';

export type ProjectSummaryReportRow = {
  id: string;
  name: unknown;
  code: string;
  status: StatusEnum;
  budget: unknown;
  spent: unknown;
  expectedStartDate: Date | null;
  expectedEndDate: Date | null;
  actualStartDate: Date | null;
  actualEndDate: Date | null;
  progress: unknown;
  location: {
    code: string | null;
    name: unknown;
  } | null;
};

export const ReportRepository = {
  findProjects<T extends Prisma.ProjectFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.ProjectFindManyArgs>,
  ) {
    return prisma.project.findMany(args);
  },

  findProjectSummaryProjects(params: {
    domainId: string;
    country?: string;
    projectId?: string;
    activeOnly?: boolean;
  }): Promise<ProjectSummaryReportRow[]> {
    const { domainId, country, projectId, activeOnly = true } = params;
    const filters: Prisma.Sql[] = [
      Prisma.sql`p."domainId" = ${domainId}`,
      Prisma.sql`p."isDeleted" = false`,
    ];

    if (activeOnly) {
      filters.push(Prisma.sql`p."status" = ${StatusEnum.ACTIVE}`);
    }

    if (projectId) {
      filters.push(Prisma.sql`p."id" = ${projectId}`);
    }

    if (country) {
      filters.push(Prisma.sql`(
        LOWER(l."code") = ${country.toLowerCase()}
        OR l."searchText" LIKE ${`%${country.toLowerCase()}%`}
      )`);
    }

    return prisma.$queryRaw<ProjectSummaryReportRow[]>(Prisma.sql`
      SELECT
        p."id",
        p."name",
        p."code",
        p."status",
        p."budget",
        p."spent",
        p."expectedStartDate",
        p."expectedEndDate",
        p."actualStartDate",
        p."actualEndDate",
        ${projectProgressSql} AS "progress",
        jsonb_build_object(
          'code', l."code",
          'name', l."name"
        ) AS "location"
      FROM "Project" p
      LEFT JOIN "Location" l ON l."id" = p."locationId"
        AND l."domainId" = p."domainId"
        AND l."isDeleted" = false
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY p."createdAt" DESC
    `);
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

  findUoms<T extends Prisma.UomFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.UomFindManyArgs>,
  ) {
    return prisma.uom.findMany(args);
  },

  findInvoices<T extends Prisma.InvoiceFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.InvoiceFindManyArgs>,
  ) {
    return prisma.invoice.findMany(args);
  },

  findGrnProducts<T extends Prisma.GrnProductFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.GrnProductFindManyArgs>,
  ) {
    return prisma.grnProduct.findMany(args);
  },
};
