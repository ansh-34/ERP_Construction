import { DomainRepository } from '../../../repositories/index.js';
import {
  reportService,
  type ReportWorkbookWorksheet,
} from '../../domain/report/report.service.js';

export type { ReportWorkbookWorksheet };

type DomainFilter = {
  domainIds?: string[];
  search?: string;
};

type DomainRef = {
  id: string;
  name: string;
};

type GroupedReport<R extends object> = { domain: DomainRef } & R;

function localizeName(value: unknown, language: string | null): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const lang = language || 'en';
    const localized = record[lang] ?? record.en;
    return typeof localized === 'string' ? localized : '';
  }

  return String(value);
}

// Always scoped by adminId, so an admin can never resolve a domain they don't own.
async function resolveDomains(
  adminId: string,
  filter: DomainFilter,
  language: string | null,
): Promise<DomainRef[]> {
  const domains = await DomainRepository.findAccessibleByAdmin(adminId, {
    domainIds: filter.domainIds,
    search: filter.search,
  });

  return domains.map((domain) => ({
    id: domain.id,
    name: localizeName(domain.name, language),
  }));
}

// Groups one report per domain. A domain missing a filtered entity throws
// "not found" in the underlying service; we skip it instead of failing the request.
async function runGrouped<R extends object>(
  adminId: string,
  filter: DomainFilter,
  language: string | null,
  run: (domainId: string) => Promise<R>,
): Promise<GroupedReport<R>[]> {
  const domains = await resolveDomains(adminId, filter, language);

  const grouped: Array<GroupedReport<R> | null> = new Array(
    domains.length,
  ).fill(null);

  await Promise.all(
    domains.map(async (domain, index) => {
      try {
        const report = await run(domain.id);
        grouped[index] = { domain, ...report } as GroupedReport<R>;
      } catch (error) {
        if (error instanceof Error && error.message === 'not found') {
          return;
        }
        throw error;
      }
    }),
  );

  return grouped.filter(
    (result): result is GroupedReport<R> => result !== null,
  );
}

// Merges same-named worksheets across domains into one sheet, prefixing each row
// with a `domainName` column so a single export holds every domain's rows.
async function runGroupedWorkbook(
  adminId: string,
  filter: DomainFilter,
  language: string | null,
  run: (domainId: string) => Promise<ReportWorkbookWorksheet[]>,
): Promise<ReportWorkbookWorksheet[]> {
  const domains = await resolveDomains(adminId, filter, language);

  const merged = new Map<string, ReportWorkbookWorksheet>();
  const order: string[] = [];

  for (const domain of domains) {
    let worksheets: ReportWorkbookWorksheet[];
    try {
      worksheets = await run(domain.id);
    } catch (error) {
      if (error instanceof Error && error.message === 'not found') {
        continue;
      }
      throw error;
    }

    for (const sheet of worksheets) {
      if (!merged.has(sheet.name)) {
        merged.set(sheet.name, {
          name: sheet.name,
          columns: ['domainName', ...sheet.columns],
          rows: [],
        });
        order.push(sheet.name);
      }

      const target = merged.get(sheet.name)!;
      for (const row of sheet.rows) {
        target.rows.push({ domainName: domain.name, ...row });
      }
    }
  }

  return order.map((name) => merged.get(name)!);
}

export const AdminReportService = {
  listAccessibleDomains: (
    adminId: string,
    filter: DomainFilter,
    language: string | null = null,
  ) => resolveDomains(adminId, filter, language),

  getProjectSummary: (
    adminId: string,
    filter: DomainFilter & { country?: string },
    language: string | null = null,
  ) =>
    runGrouped(adminId, filter, language, (domainId) =>
      reportService.getProjectSummary(
        domainId,
        { country: filter.country },
        language,
      ),
    ),

  getProjectWorkbookWorksheets: (
    adminId: string,
    filter: DomainFilter & { country?: string; projectId?: string },
    language: string | null = null,
  ) =>
    runGroupedWorkbook(adminId, filter, language, (domainId) =>
      reportService.getProjectWorkbookWorksheets(
        domainId,
        { country: filter.country, projectId: filter.projectId },
        language,
      ),
    ),

  getProjectUserTask: (
    adminId: string,
    filter: DomainFilter & { projectId?: string; userId?: string },
    language: string | null = null,
  ) =>
    runGrouped(adminId, filter, language, (domainId) =>
      reportService.getProjectUserTaskReport(
        domainId,
        { projectId: filter.projectId, userId: filter.userId },
        language,
      ),
    ),

  getProjectUserTaskSummary: (
    adminId: string,
    filter: DomainFilter & { projectId?: string; userId?: string },
    language: string | null = null,
  ) =>
    runGrouped(adminId, filter, language, (domainId) =>
      reportService.getProjectUserTaskSummaryReport(
        domainId,
        { projectId: filter.projectId, userId: filter.userId },
        language,
      ),
    ),

  getProjectUserTaskWorkbookWorksheets: (
    adminId: string,
    filter: DomainFilter & { projectId?: string; userId?: string },
    language: string | null = null,
  ) =>
    runGroupedWorkbook(adminId, filter, language, (domainId) =>
      reportService.getProjectUserTaskWorkbookWorksheets(
        domainId,
        { projectId: filter.projectId, userId: filter.userId },
        language,
      ),
    ),

  getMachineSummary: (
    adminId: string,
    filter: DomainFilter & { projectId?: string; machineryId?: string },
    language: string | null = null,
  ) =>
    runGrouped(adminId, filter, language, (domainId) =>
      reportService.getMachineSummaryReport(
        domainId,
        { projectId: filter.projectId, machineryId: filter.machineryId },
        language,
      ),
    ),

  getMachineSummaryDashboard: (
    adminId: string,
    filter: DomainFilter & { projectId?: string; machineryId?: string },
    language: string | null = null,
  ) =>
    runGrouped(adminId, filter, language, (domainId) =>
      reportService.getMachineSummaryDashboardReport(
        domainId,
        { projectId: filter.projectId, machineryId: filter.machineryId },
        language,
      ),
    ),

  getMachineWorkbookWorksheets: (
    adminId: string,
    filter: DomainFilter & {
      projectId?: string;
      machineryId?: string;
      vehicleId?: string;
    },
    language: string | null = null,
  ) =>
    runGroupedWorkbook(adminId, filter, language, (domainId) =>
      reportService.getMachineWorkbookWorksheets(
        domainId,
        {
          projectId: filter.projectId,
          machineryId: filter.machineryId,
          vehicleId: filter.vehicleId,
        },
        language,
      ),
    ),

  getProductInventory: (
    adminId: string,
    filter: DomainFilter & {
      productId?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    },
    language: string | null = null,
  ) =>
    runGrouped(adminId, filter, language, (domainId) =>
      reportService.getProductInventoryReport(
        domainId,
        { productId: filter.productId, status: filter.status },
        language,
      ),
    ),

  getProductInventoryWorkbookWorksheets: (
    adminId: string,
    filter: DomainFilter & {
      productId?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    },
    language: string | null = null,
  ) =>
    runGroupedWorkbook(adminId, filter, language, (domainId) =>
      reportService.getProductInventoryWorkbookWorksheets(
        domainId,
        { productId: filter.productId, status: filter.status },
        language,
      ),
    ),

  getVendorPurchaseHistory: (
    adminId: string,
    filter: DomainFilter & { vendorId?: string; projectId?: string },
    language: string | null = null,
  ) =>
    runGrouped(adminId, filter, language, (domainId) =>
      reportService.getVendorPurchaseHistoryReport(
        domainId,
        { vendorId: filter.vendorId, projectId: filter.projectId },
        language,
      ),
    ),

  getVendorPurchaseHistoryWorkbookWorksheets: (
    adminId: string,
    filter: DomainFilter & { vendorId?: string; projectId?: string },
    language: string | null = null,
  ) =>
    runGroupedWorkbook(adminId, filter, language, (domainId) =>
      reportService.getVendorPurchaseHistoryWorkbookWorksheets(
        domainId,
        { vendorId: filter.vendorId, projectId: filter.projectId },
        language,
      ),
    ),

  getProductTransactionHistory: (
    adminId: string,
    filter: DomainFilter & {
      productId?: string;
      projectId?: string;
      startDate?: string;
      endDate?: string;
    },
    language: string | null = null,
  ) =>
    runGrouped(adminId, filter, language, (domainId) =>
      reportService.getProductTransactionHistoryReport(
        domainId,
        {
          productId: filter.productId,
          projectId: filter.projectId,
          startDate: filter.startDate,
          endDate: filter.endDate,
        },
        language,
      ),
    ),

  getProductTransactionHistoryWorkbookWorksheets: (
    adminId: string,
    filter: DomainFilter & {
      productId?: string;
      projectId?: string;
      startDate?: string;
      endDate?: string;
    },
    language: string | null = null,
  ) =>
    runGroupedWorkbook(adminId, filter, language, (domainId) =>
      reportService.getProductTransactionHistoryWorkbookWorksheets(
        domainId,
        {
          productId: filter.productId,
          projectId: filter.projectId,
          startDate: filter.startDate,
          endDate: filter.endDate,
        },
        language,
      ),
    ),
};
