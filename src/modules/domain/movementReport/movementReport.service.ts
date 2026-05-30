import {
  movementLogRepository,
  type MaintenanceAssetType,
  type MovementLogRecord,
  type MovementType,
} from '@repositories/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { isNonEmptyString } from '@/utils/validation';

interface MovementReportFilters {
  assetType?: MaintenanceAssetType;
  movementType?: MovementType;
  vehicleId?: string;
  machineryId?: string;
  projectId?: string;
  fromDate?: string;
  toDate?: string;
}

interface MovementReportSummary {
  totalMovements: number;
  totalHours: number;
  totalMeterUsage: number;
  vehicleMovements: number;
  machineryMovements: number;
}

interface HoursByProjectSite {
  projectId: string | null;
  projectCode: string;
  projectName: string | Record<string, unknown>;
  hours: number;
  movements: number;
  meterUsage: number;
}

interface HoursByMovementType {
  movementType: MovementType;
  hours: number;
  movements: number;
  meterUsage: number;
}

interface AssetUsage {
  assetType: MaintenanceAssetType;
  assetId: string;
  assetCode: string;
  hours: number;
  movements: number;
  meterUsage: number;
}

interface MovementReport {
  summary: MovementReportSummary;
  hoursByProjectSite: HoursByProjectSite[];
  hoursByMovementType: HoursByMovementType[];
  assetUsage: AssetUsage[];
}

function parseDate(value: string | undefined, field: string): Date | undefined {
  if (value === undefined) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`invalid ${field}`);

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

function getAsset(log: MovementLogRecord): {
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

function buildSummary(logs: MovementLogRecord[]): MovementReportSummary {
  const summary = logs.reduce(
    (result, log) => {
      result.totalMovements += 1;
      result.totalHours += toNumber(log.hours);
      result.totalMeterUsage += toNumber(log.meterUsage);

      if (log.assetType === 'VEHICLE') result.vehicleMovements += 1;
      if (log.assetType === 'MACHINERY') result.machineryMovements += 1;

      return result;
    },
    {
      totalMovements: 0,
      totalHours: 0,
      totalMeterUsage: 0,
      vehicleMovements: 0,
      machineryMovements: 0,
    },
  );

  return {
    ...summary,
    totalHours: roundToTwo(summary.totalHours),
    totalMeterUsage: roundToTwo(summary.totalMeterUsage),
  };
}

function buildHoursByProjectSite(
  logs: MovementLogRecord[],
): HoursByProjectSite[] {
  const projects = new Map<string, HoursByProjectSite>();

  logs.forEach((log) => {
    const key = log.projectId ?? 'UNASSIGNED';
    const existing = projects.get(key) ?? {
      projectId: log.projectId,
      projectCode: String(log.project?.code ?? 'UNASSIGNED'),
      projectName:
        (log.project?.name as Record<string, unknown> | undefined) ?? '',
      hours: 0,
      movements: 0,
      meterUsage: 0,
    };

    existing.hours += toNumber(log.hours);
    existing.movements += 1;
    existing.meterUsage += toNumber(log.meterUsage);
    projects.set(key, existing);
  });

  return [...projects.values()]
    .map((project) => ({
      ...project,
      hours: roundToTwo(project.hours),
      meterUsage: roundToTwo(project.meterUsage),
    }))
    .sort((projectA, projectB) => projectB.hours - projectA.hours);
}

function buildHoursByMovementType(
  logs: MovementLogRecord[],
): HoursByMovementType[] {
  const movementTypes = new Map<MovementType, HoursByMovementType>();

  logs.forEach((log) => {
    const existing = movementTypes.get(log.movementType) ?? {
      movementType: log.movementType,
      hours: 0,
      movements: 0,
      meterUsage: 0,
    };

    existing.hours += toNumber(log.hours);
    existing.movements += 1;
    existing.meterUsage += toNumber(log.meterUsage);
    movementTypes.set(log.movementType, existing);
  });

  return [...movementTypes.values()]
    .map((movementType) => ({
      ...movementType,
      hours: roundToTwo(movementType.hours),
      meterUsage: roundToTwo(movementType.meterUsage),
    }))
    .sort((typeA, typeB) => typeB.hours - typeA.hours);
}

function buildAssetUsage(logs: MovementLogRecord[]): AssetUsage[] {
  const assets = new Map<string, AssetUsage>();

  logs.forEach((log) => {
    const { assetId, assetCode } = getAsset(log);
    const key = `${log.assetType}:${assetId}`;
    const existing = assets.get(key) ?? {
      assetType: log.assetType,
      assetId,
      assetCode,
      hours: 0,
      movements: 0,
      meterUsage: 0,
    };

    existing.hours += toNumber(log.hours);
    existing.movements += 1;
    existing.meterUsage += toNumber(log.meterUsage);
    assets.set(key, existing);
  });

  return [...assets.values()]
    .map((asset) => ({
      ...asset,
      hours: roundToTwo(asset.hours),
      meterUsage: roundToTwo(asset.meterUsage),
    }))
    .sort((assetA, assetB) => assetB.hours - assetA.hours);
}

export const movementReportService = {
  async getReport(
    domainId: string,
    adminId: string,
    filters: MovementReportFilters,
  ): Promise<MovementReport> {
    if (!isNonEmptyString(domainId)) throw new Error('invalid domainId');

    try {
      const logs = await movementLogRepository.findMany(domainId, adminId, {
        assetType: filters.assetType,
        movementType: filters.movementType,
        vehicleId: filters.vehicleId,
        machineryId: filters.machineryId,
        projectId: filters.projectId,
        fromDate: parseDate(filters.fromDate, 'fromDate'),
        toDate: parseDate(filters.toDate, 'toDate'),
      });

      return {
        summary: buildSummary(logs),
        hoursByProjectSite: buildHoursByProjectSite(logs),
        hoursByMovementType: buildHoursByMovementType(logs),
        assetUsage: buildAssetUsage(logs),
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
