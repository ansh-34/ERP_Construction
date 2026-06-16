import {
  movementLogRepository,
  machineryRepository,
  projectRepository,
  VehicleRepository,
  type MaintenanceAssetType,
  type MovementLogRecord,
  type MovementType,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import {
  isNonEmptyString,
  isNonNegativeFiniteNumber,
} from '@/utils/validation';

interface CreateMovementLogInput {
  code: string;
  movementType: MovementType;
  assetType: MaintenanceAssetType;
  vehicleId?: string | null;
  machineryId?: string | null;
  projectId?: string | null;
  fromLocation?: string | null;
  toLocation?: string | null;
  startDateTime: string;
  endDateTime: string;
  startMeterReading?: number | null;
  endMeterReading?: number | null;
  notes?: string | null;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

type PaginatedMovementLogs = {
  movementLogs: MovementLogRecord[];
  pagination: {
    totalCount: number;
    offset: number;
    limit: number;
  };
};

const assetTypes: MaintenanceAssetType[] = ['VEHICLE', 'MACHINERY'];
const movementTypes: MovementType[] = [
  'WAREHOUSE',
  'WAREHOUSE_TO_SITE',
  'SITE_TO_WAREHOUSE',
  'PROJECT_SITE',
  'SITE_TO_SITE',
  'OTHER',
];

function parseDate(value: string | undefined, field: string): Date | undefined {
  if (value === undefined) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`invalid ${field}`);

  return date;
}

function calculateHours(startDateTime: Date, endDateTime: Date): number {
  const hours = (endDateTime.getTime() - startDateTime.getTime()) / 3600000;

  if (hours < 0) throw new Error('endDateTime must be after startDateTime');

  return Math.round(hours * 100) / 100;
}

function calculateMeterUsage(
  startMeterReading?: number | null,
  endMeterReading?: number | null,
): number | null {
  if (startMeterReading === undefined || startMeterReading === null)
    return null;
  if (endMeterReading === undefined || endMeterReading === null) return null;
  if (endMeterReading < startMeterReading) {
    throw new Error('endMeterReading must be greater than startMeterReading');
  }

  return Math.round((endMeterReading - startMeterReading) * 100) / 100;
}

function buildSearchText(data: CreateMovementLogInput): string {
  return [
    data.code,
    data.movementType,
    data.fromLocation,
    data.toLocation,
    data.notes,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function assertAssetSelection(data: CreateMovementLogInput): void {
  if (!assetTypes.includes(data.assetType))
    throw new Error('invalid assetType');

  if (data.assetType === 'VEHICLE') {
    if (data.machineryId !== undefined && data.machineryId !== null) {
      throw new Error('machineryId must be empty');
    }
  }

  if (data.assetType === 'MACHINERY') {
    if (data.vehicleId !== undefined && data.vehicleId !== null) {
      throw new Error('vehicleId must be empty');
    }
  }
}

function assertCreateInput(data: CreateMovementLogInput): void {
  if (!isNonEmptyString(data.code)) throw new Error('invalid code');
  if (!movementTypes.includes(data.movementType)) {
    throw new Error('invalid movementType');
  }
  assertAssetSelection(data);
  parseDate(data.startDateTime, 'startDateTime');
  parseDate(data.endDateTime, 'endDateTime');
  if (
    data.startMeterReading !== undefined &&
    data.startMeterReading !== null &&
    !isNonNegativeFiniteNumber(data.startMeterReading)
  ) {
    throw new Error('invalid startMeterReading');
  }
  if (
    data.endMeterReading !== undefined &&
    data.endMeterReading !== null &&
    !isNonNegativeFiniteNumber(data.endMeterReading)
  ) {
    throw new Error('invalid endMeterReading');
  }
  if (!isNonEmptyString(data.domainId)) throw new Error('invalid domainId');
  if (!isNonEmptyString(data.adminId)) throw new Error('invalid adminId');
}

async function assertRelationsExist(
  data: CreateMovementLogInput,
): Promise<void> {
  if (data.assetType === 'VEHICLE' && isNonEmptyString(data.vehicleId)) {
    const vehicle = await VehicleRepository.findActiveByIdAndDomain(
      data.vehicleId,
      data.domainId,
    );
    if (!vehicle) throw new Error('invalid vehicleId');
  }

  if (data.assetType === 'MACHINERY' && isNonEmptyString(data.machineryId)) {
    const machinery = await machineryRepository.findById(
      data.machineryId,
      data.domainId,
      data.adminId,
    );
    if (!machinery) throw new Error('invalid machineryId');
  }

  if (data.projectId) {
    const project = await projectRepository.findById(
      data.projectId,
      data.domainId,
      data.adminId,
    );
    if (!project) throw new Error('invalid projectId');
  }
}

export const movementLogService = {
  async create(data: CreateMovementLogInput): Promise<MovementLogRecord> {
    // Frontend sends unused ids as "" — treat empty strings as not provided
    data.vehicleId = isNonEmptyString(data.vehicleId) ? data.vehicleId : null;
    data.machineryId = isNonEmptyString(data.machineryId)
      ? data.machineryId
      : null;
    data.projectId = isNonEmptyString(data.projectId) ? data.projectId : null;

    assertCreateInput(data);

    try {
      await assertRelationsExist(data);

      const existing = await movementLogRepository.findByCode(
        data.code,
        data.domainId,
        data.adminId,
      );
      if (existing) throw new Error('duplicate code');

      const startDateTime = parseDate(
        data.startDateTime,
        'startDateTime',
      ) as Date;
      const endDateTime = parseDate(data.endDateTime, 'endDateTime') as Date;

      const log = await movementLogRepository.create({
        ...data,
        searchText: buildSearchText(data),
        startDateTime,
        endDateTime,
        hours: calculateHours(startDateTime, endDateTime),
        meterUsage: calculateMeterUsage(
          data.startMeterReading,
          data.endMeterReading,
        ),
      });

      if (
        data.assetType === 'MACHINERY' &&
        data.machineryId &&
        data.projectId
      ) {
        await machineryRepository.update(
          data.machineryId,
          data.domainId,
          { projectId: data.projectId },
          data.adminId,
        );
      }

      return log;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async getAll(
    domainId: string,
    adminId: string,
    query: PaginationQuery & {
      assetType?: MaintenanceAssetType;
      movementType?: MovementType;
      vehicleId?: string;
      machineryId?: string;
      projectId?: string;
      searchKey?: string;
      fromDate?: string;
      toDate?: string;
    },
  ): Promise<PaginatedMovementLogs> {
    try {
      const { offset, limit } = normalizePagination(query);
      const logs = await movementLogRepository.findMany(domainId, adminId, {
        assetType: query.assetType,
        movementType: query.movementType,
        vehicleId: query.vehicleId,
        machineryId: query.machineryId,
        projectId: query.projectId,
        searchKey: query.searchKey,
        fromDate: parseDate(query.fromDate, 'fromDate'),
        toDate: parseDate(query.toDate, 'toDate'),
      });

      return {
        movementLogs: logs.slice(offset, offset + limit),
        pagination: { totalCount: logs.length, offset, limit },
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async getById(
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<MovementLogRecord | null> {
    if (!isNonEmptyString(id)) throw new Error('invalid id');
    if (!isNonEmptyString(domainId)) throw new Error('invalid domainId');

    try {
      return await movementLogRepository.findById(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async softDelete(
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<MovementLogRecord | null> {
    const existing = await movementLogService.getById(id, domainId, adminId);
    if (!existing) return null;

    try {
      return await movementLogRepository.softDelete(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
