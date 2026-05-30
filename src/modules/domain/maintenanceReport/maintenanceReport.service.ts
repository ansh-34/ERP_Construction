import {
  maintenanceLogRepository,
  type MaintenanceAssetType,
  type MaintenanceLogRecord,
} from '@repositories/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { isNonEmptyString } from '@/utils/validation';

type MaintenanceReportGroupBy = 'WEEK' | 'MONTH' | 'YEAR';

interface MaintenanceReportFilters {
  groupBy?: MaintenanceReportGroupBy;
  assetType?: MaintenanceAssetType;
  vehicleId?: string;
  machineryId?: string;
  fromDate?: string;
  toDate?: string;
}

interface MaintenanceReportSummary {
  totalExpense: number;
  vehicleExpense: number;
  machineryExpense: number;
  totalLogs: number;
}

interface MaintenanceReportPeriod {
  period: string;
  vehicleExpense: number;
  machineryExpense: number;
  totalExpense: number;
  logCount: number;
  delta: number;
}

interface MaintenanceReportAssetExpense {
  assetType: MaintenanceAssetType;
  assetId: string;
  assetCode: string;
  expense: number;
  logCount: number;
}

interface MaintenanceReport {
  groupBy: MaintenanceReportGroupBy;
  summary: MaintenanceReportSummary;
  periodComparison: MaintenanceReportPeriod[];
  assetExpenses: MaintenanceReportAssetExpense[];
}

function parseDate(value: string | undefined, field: string): Date | undefined {
  if (value === undefined) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`invalid ${field}`);
  }

  return date;
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;

  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function getIsoWeek(date: Date): string {
  const normalizedDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = normalizedDate.getUTCDay() || 7;

  normalizedDate.setUTCDate(normalizedDate.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(normalizedDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((normalizedDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );

  return `${normalizedDate.getUTCFullYear()}-W${pad(week)}`;
}

function getPeriod(date: Date, groupBy: MaintenanceReportGroupBy): string {
  if (groupBy === 'WEEK') return getIsoWeek(date);
  if (groupBy === 'YEAR') return String(date.getUTCFullYear());

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

function getAsset(log: MaintenanceLogRecord): {
  assetId: string;
  assetCode: string;
} {
  if (log.assetType === 'VEHICLE') {
    return {
      assetId: log.vehicleId ?? '',
      assetCode: String(log.vehicle?.numberPlate ?? ''),
    };
  }

  return {
    assetId: log.machineryId ?? '',
    assetCode: String(log.machinery?.code ?? ''),
  };
}

function buildSummary(logs: MaintenanceLogRecord[]): MaintenanceReportSummary {
  const summary = logs.reduce(
    (result, log) => {
      const expense = toNumber(log.expenseAmount);

      result.totalExpense += expense;
      result.totalLogs += 1;

      if (log.assetType === 'VEHICLE') {
        result.vehicleExpense += expense;
      } else {
        result.machineryExpense += expense;
      }

      return result;
    },
    {
      totalExpense: 0,
      vehicleExpense: 0,
      machineryExpense: 0,
      totalLogs: 0,
    },
  );

  return {
    ...summary,
    totalExpense: roundToTwo(summary.totalExpense),
    vehicleExpense: roundToTwo(summary.vehicleExpense),
    machineryExpense: roundToTwo(summary.machineryExpense),
  };
}

function buildPeriodComparison(
  logs: MaintenanceLogRecord[],
  groupBy: MaintenanceReportGroupBy,
): MaintenanceReportPeriod[] {
  const periods = new Map<
    string,
    Omit<MaintenanceReportPeriod, 'period' | 'delta'>
  >();

  logs.forEach((log) => {
    const period = getPeriod(new Date(log.date), groupBy);
    const expense = toNumber(log.expenseAmount);
    const existing = periods.get(period) ?? {
      vehicleExpense: 0,
      machineryExpense: 0,
      totalExpense: 0,
      logCount: 0,
    };

    existing.totalExpense += expense;
    existing.logCount += 1;

    if (log.assetType === 'VEHICLE') {
      existing.vehicleExpense += expense;
    } else {
      existing.machineryExpense += expense;
    }

    periods.set(period, existing);
  });

  let previousTotalExpense = 0;

  return [...periods.entries()]
    .sort(([periodA], [periodB]) => periodA.localeCompare(periodB))
    .map(([period, values]) => {
      const totalExpense = roundToTwo(values.totalExpense);
      const result = {
        period,
        vehicleExpense: roundToTwo(values.vehicleExpense),
        machineryExpense: roundToTwo(values.machineryExpense),
        totalExpense,
        logCount: values.logCount,
        delta: roundToTwo(totalExpense - previousTotalExpense),
      };

      previousTotalExpense = totalExpense;

      return result;
    });
}

function buildAssetExpenses(
  logs: MaintenanceLogRecord[],
): MaintenanceReportAssetExpense[] {
  const assets = new Map<string, MaintenanceReportAssetExpense>();

  logs.forEach((log) => {
    const { assetId, assetCode } = getAsset(log);
    const key = `${log.assetType}:${assetId}`;
    const existing = assets.get(key) ?? {
      assetType: log.assetType,
      assetId,
      assetCode,
      expense: 0,
      logCount: 0,
    };

    existing.expense += toNumber(log.expenseAmount);
    existing.logCount += 1;
    assets.set(key, existing);
  });

  return [...assets.values()]
    .map((asset) => ({
      ...asset,
      expense: roundToTwo(asset.expense),
    }))
    .sort((assetA, assetB) => assetB.expense - assetA.expense);
}

export const maintenanceReportService = {
  async getReport(
    domainId: string,
    adminId: string,
    filters: MaintenanceReportFilters,
  ): Promise<MaintenanceReport> {
    if (!isNonEmptyString(domainId)) throw new Error('invalid domainId');

    try {
      const groupBy = filters.groupBy ?? 'MONTH';
      const logs = await maintenanceLogRepository.findMany(domainId, adminId, {
        assetType: filters.assetType,
        vehicleId: filters.vehicleId,
        machineryId: filters.machineryId,
        fromDate: parseDate(filters.fromDate, 'fromDate'),
        toDate: parseDate(filters.toDate, 'toDate'),
      });

      return {
        groupBy,
        summary: buildSummary(logs),
        periodComparison: buildPeriodComparison(logs, groupBy),
        assetExpenses: buildAssetExpenses(logs),
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
