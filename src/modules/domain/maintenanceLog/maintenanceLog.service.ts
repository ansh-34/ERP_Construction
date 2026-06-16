import {
  maintenanceLogRepository,
  maintenanceScheduleRepository,
  machineryRepository,
  VehicleRepository,
  type MaintenanceAssetType,
  type MaintenanceLogRecord,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import {
  isNonEmptyString,
  isNonNegativeFiniteNumber,
  isPlainObject,
} from '@/utils/validation';

interface CreateMaintenanceLogInput {
  code: string;
  date: string;
  description: Record<string, unknown>;
  assetType: MaintenanceAssetType;
  vehicleId?: string | null;
  machineryId?: string | null;
  maintenanceScheduleId?: string | null;
  expenseAmount: number;
  meterReading?: number | null;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

type LocalizedText = string | Record<string, unknown>;
type LocalizedMaintenanceLogRecord = Omit<
  MaintenanceLogRecord,
  'description'
> & {
  description: LocalizedText;
};

type PaginatedMaintenanceLogs = {
  maintenanceLogs: LocalizedMaintenanceLogRecord[];
  pagination: {
    totalCount: number;
    offset: number;
    limit: number;
  };
};

const assetTypes: MaintenanceAssetType[] = ['VEHICLE', 'MACHINERY'];

function buildSearchText(
  code: string,
  description: Record<string, unknown>,
): string {
  return `${code} ${Object.values(description).join(' ')}`.toLowerCase();
}

function parseDate(value: string | undefined, field: string): Date | undefined {
  if (value === undefined) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`invalid ${field}`);
  }

  return date;
}

function getLocalizedText(
  value: Record<string, unknown>,
  language: string | null,
): LocalizedText {
  if (!language) return value;

  const localizedValue = value[language] ?? value.en ?? '';

  return typeof localizedValue === 'string'
    ? localizedValue
    : String(localizedValue);
}

function normalizeMaintenanceLog(
  log: MaintenanceLogRecord,
  language: string | null,
): LocalizedMaintenanceLogRecord {
  return {
    ...log,
    description: getLocalizedText(log.description, language),
  };
}

function assertStatus(status: StatusEnum | undefined): void {
  if (
    status !== undefined &&
    status !== StatusEnum.ACTIVE &&
    status !== StatusEnum.INACTIVE
  ) {
    throw new Error('invalid status');
  }
}

function assertAssetType(assetType: MaintenanceAssetType | undefined): void {
  if (assetType !== undefined && !assetTypes.includes(assetType)) {
    throw new Error('invalid assetType');
  }
}

function assertDescription(
  description: Record<string, unknown> | undefined,
): void {
  if (!isPlainObject(description) || !isNonEmptyString(description.en)) {
    throw new Error('description.en is required');
  }
}

function assertAssetSelection(
  assetType: MaintenanceAssetType,
  vehicleId?: string | null,
  machineryId?: string | null,
): void {
  if (assetType === 'VEHICLE') {
    if (machineryId !== undefined && machineryId !== null) {
      throw new Error('machineryId must be empty');
    }
  }

  if (assetType === 'MACHINERY') {
    if (vehicleId !== undefined && vehicleId !== null) {
      throw new Error('vehicleId must be empty');
    }
  }
}

async function assertAssetExists(
  assetType: MaintenanceAssetType,
  domainId: string,
  adminId: string,
  vehicleId?: string | null,
  machineryId?: string | null,
): Promise<void> {
  if (assetType === 'VEHICLE' && isNonEmptyString(vehicleId)) {
    const vehicle = await VehicleRepository.findActiveByIdAndDomain(
      vehicleId,
      domainId,
    );

    if (!vehicle) throw new Error('invalid vehicleId');
  }

  if (assetType === 'MACHINERY' && isNonEmptyString(machineryId)) {
    const machinery = await machineryRepository.findById(
      machineryId,
      domainId,
      adminId,
    );

    if (!machinery) throw new Error('invalid machineryId');
  }
}

async function assertScheduleMatchesAsset(
  data: CreateMaintenanceLogInput,
): Promise<void> {
  if (!data.maintenanceScheduleId) return;

  const schedule = await maintenanceScheduleRepository.findById(
    data.maintenanceScheduleId,
    data.domainId,
    data.adminId,
  );

  if (!schedule) throw new Error('invalid maintenanceScheduleId');
  if (schedule.assetType !== data.assetType) {
    throw new Error('maintenanceScheduleId assetType mismatch');
  }
  if (
    data.assetType === 'VEHICLE' &&
    schedule.vehicleId !== (data.vehicleId ?? null)
  ) {
    throw new Error('maintenanceScheduleId vehicle mismatch');
  }
  if (
    data.assetType === 'MACHINERY' &&
    schedule.machineryId !== (data.machineryId ?? null)
  ) {
    throw new Error('maintenanceScheduleId machinery mismatch');
  }
}

function assertCreateInput(data: CreateMaintenanceLogInput): void {
  if (!isNonEmptyString(data.code)) throw new Error('invalid code');
  parseDate(data.date, 'date');
  assertDescription(data.description);
  assertAssetType(data.assetType);
  assertAssetSelection(data.assetType, data.vehicleId, data.machineryId);
  if (!isNonNegativeFiniteNumber(data.expenseAmount)) {
    throw new Error('invalid expenseAmount');
  }
  if (
    data.meterReading !== undefined &&
    data.meterReading !== null &&
    !isNonNegativeFiniteNumber(data.meterReading)
  ) {
    throw new Error('invalid meterReading');
  }
  if (!isNonEmptyString(data.domainId)) throw new Error('invalid domainId');
  if (!isNonEmptyString(data.adminId)) throw new Error('invalid adminId');
  assertStatus(data.status);
}

export const maintenanceLogService = {
  async create(
    data: CreateMaintenanceLogInput,
    language: string | null = null,
  ): Promise<LocalizedMaintenanceLogRecord> {
    // Frontend sends unused ids as "" — treat empty strings as not provided
    data.vehicleId = isNonEmptyString(data.vehicleId) ? data.vehicleId : null;
    data.machineryId = isNonEmptyString(data.machineryId)
      ? data.machineryId
      : null;
    data.maintenanceScheduleId = isNonEmptyString(data.maintenanceScheduleId)
      ? data.maintenanceScheduleId
      : null;

    assertCreateInput(data);

    try {
      await assertAssetExists(
        data.assetType,
        data.domainId,
        data.adminId,
        data.vehicleId,
        data.machineryId,
      );
      await assertScheduleMatchesAsset(data);

      const existing = await maintenanceLogRepository.findByCode(
        data.code,
        data.domainId,
        data.adminId,
      );
      if (existing) throw new Error('duplicate code');

      const log = await maintenanceLogRepository.create({
        ...data,
        searchText: buildSearchText(data.code, data.description),
        date: parseDate(data.date, 'date') as Date,
      });

      return normalizeMaintenanceLog(log, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async getAll(
    domainId: string,
    adminId: string,
    query: PaginationQuery & {
      assetType?: MaintenanceAssetType;
      vehicleId?: string;
      machineryId?: string;
      maintenanceScheduleId?: string;
      status?: StatusEnum;
      searchKey?: string;
      fromDate?: string;
      toDate?: string;
    },
    language: string | null = null,
  ): Promise<PaginatedMaintenanceLogs> {
    try {
      const { offset, limit } = normalizePagination(query);
      const logs = await maintenanceLogRepository.findMany(domainId, adminId, {
        assetType: query.assetType,
        vehicleId: query.vehicleId,
        machineryId: query.machineryId,
        maintenanceScheduleId: query.maintenanceScheduleId,
        status: query.status,
        searchKey: query.searchKey,
        fromDate: parseDate(query.fromDate, 'fromDate'),
        toDate: parseDate(query.toDate, 'toDate'),
      });

      const paginatedLogs = logs.slice(offset, offset + limit);

      return {
        maintenanceLogs: paginatedLogs.map((log) =>
          normalizeMaintenanceLog(log, language),
        ),
        pagination: {
          totalCount: logs.length,
          offset,
          limit,
        },
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async getById(
    id: string,
    domainId: string,
    adminId: string,
    language: string | null = null,
  ): Promise<LocalizedMaintenanceLogRecord | null> {
    if (!isNonEmptyString(id)) throw new Error('invalid id');
    if (!isNonEmptyString(domainId)) throw new Error('invalid domainId');

    try {
      const log = await maintenanceLogRepository.findById(
        id,
        domainId,
        adminId,
      );

      return log ? normalizeMaintenanceLog(log, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async softDelete(
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<MaintenanceLogRecord | null> {
    if (!isNonEmptyString(id)) throw new Error('invalid id');
    if (!isNonEmptyString(domainId)) throw new Error('invalid domainId');

    try {
      const existing = await maintenanceLogRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existing) return null;

      return maintenanceLogRepository.softDelete(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
