import {
  maintenanceScheduleRepository,
  machineryRepository,
  VehicleRepository,
  type MaintenanceAssetType,
  type MaintenanceScheduleRecord,
  type MaintenanceScheduleStatus,
  type UpdateMaintenanceScheduleInput,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import { isNonEmptyString, isPlainObject } from '@/utils/validation';

interface CreateMaintenanceScheduleInput {
  code: string;
  title: Record<string, unknown>;
  assetType: MaintenanceAssetType;
  vehicleId?: string | null;
  machineryId?: string | null;
  nextDueDate: string;
  scheduleStatus: MaintenanceScheduleStatus;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

interface ServiceUpdateMaintenanceScheduleInput {
  code?: string;
  title?: Record<string, unknown>;
  assetType?: MaintenanceAssetType;
  vehicleId?: string | null;
  machineryId?: string | null;
  nextDueDate?: string;
  scheduleStatus?: MaintenanceScheduleStatus;
  status?: StatusEnum;
}

type LocalizedText = string | Record<string, unknown>;
type LocalizedMaintenanceScheduleRecord = Omit<
  MaintenanceScheduleRecord,
  'title'
> & {
  title: LocalizedText;
};

type PaginatedMaintenanceSchedules = {
  maintenanceSchedules: LocalizedMaintenanceScheduleRecord[];
  pagination: {
    totalCount: number;
    offset: number;
    limit: number;
  };
};

const assetTypes: MaintenanceAssetType[] = ['VEHICLE', 'MACHINERY'];
const scheduleStatuses: MaintenanceScheduleStatus[] = [
  'SCHEDULED',
  'OVERDUE',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

function buildSearchText(code: string, title: Record<string, unknown>): string {
  return `${code} ${Object.values(title).join(' ')}`.toLowerCase();
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

function normalizeMaintenanceSchedule(
  schedule: MaintenanceScheduleRecord,
  language: string | null,
): LocalizedMaintenanceScheduleRecord {
  return {
    ...schedule,
    title: getLocalizedText(schedule.title, language),
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

function assertScheduleStatus(
  scheduleStatus: MaintenanceScheduleStatus | undefined,
): void {
  if (
    scheduleStatus !== undefined &&
    !scheduleStatuses.includes(scheduleStatus)
  ) {
    throw new Error('invalid scheduleStatus');
  }
}

function assertAssetType(assetType: MaintenanceAssetType | undefined): void {
  if (assetType !== undefined && !assetTypes.includes(assetType)) {
    throw new Error('invalid assetType');
  }
}

function assertTitle(title: Record<string, unknown> | undefined): void {
  if (title === undefined) return;

  if (!isPlainObject(title) || !isNonEmptyString(title.en)) {
    throw new Error('title.en is required');
  }
}

function assertAssetSelection(
  assetType: MaintenanceAssetType,
  vehicleId?: string | null,
  machineryId?: string | null,
): void {
  if (assetType === 'VEHICLE') {
    if (!isNonEmptyString(vehicleId)) {
      throw new Error('vehicleId is required');
    }

    if (machineryId !== undefined && machineryId !== null) {
      throw new Error('machineryId must be empty');
    }
  }

  if (assetType === 'MACHINERY') {
    if (!isNonEmptyString(machineryId)) {
      throw new Error('machineryId is required');
    }

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
  if (assetType === 'VEHICLE') {
    const vehicle = await VehicleRepository.findActiveByIdAndDomain(
      vehicleId ?? '',
      domainId,
    );

    if (!vehicle) throw new Error('invalid vehicleId');
  }

  if (assetType === 'MACHINERY') {
    const machinery = await machineryRepository.findById(
      machineryId ?? '',
      domainId,
      adminId,
    );

    if (!machinery) throw new Error('invalid machineryId');
  }
}

function assertCreateInput(data: CreateMaintenanceScheduleInput): void {
  if (!isNonEmptyString(data.code)) throw new Error('invalid code');
  assertTitle(data.title);
  assertAssetType(data.assetType);
  assertAssetSelection(data.assetType, data.vehicleId, data.machineryId);
  parseDate(data.nextDueDate, 'nextDueDate');
  assertScheduleStatus(data.scheduleStatus);
  if (!isNonEmptyString(data.domainId)) throw new Error('invalid domainId');
  if (!isNonEmptyString(data.adminId)) throw new Error('invalid adminId');
  assertStatus(data.status);
}

function assertUpdateInput(data: ServiceUpdateMaintenanceScheduleInput): void {
  const hasAnyField = Object.values(data).some((value) => value !== undefined);
  if (!hasAnyField) throw new Error('empty update payload');

  if (data.code !== undefined && !isNonEmptyString(data.code)) {
    throw new Error('invalid code');
  }

  assertTitle(data.title);
  assertAssetType(data.assetType);
  parseDate(data.nextDueDate, 'nextDueDate');
  assertScheduleStatus(data.scheduleStatus);
  assertStatus(data.status);
}

export const maintenanceScheduleService = {
  async create(
    data: CreateMaintenanceScheduleInput,
    language: string | null = null,
  ): Promise<LocalizedMaintenanceScheduleRecord> {
    assertCreateInput(data);

    try {
      await assertAssetExists(
        data.assetType,
        data.domainId,
        data.adminId,
        data.vehicleId,
        data.machineryId,
      );

      const existing = await maintenanceScheduleRepository.findByCode(
        data.code,
        data.domainId,
        data.adminId,
      );
      if (existing) throw new Error('duplicate code');

      const schedule = await maintenanceScheduleRepository.create({
        ...data,
        title: data.title,
        searchText: buildSearchText(data.code, data.title),
        nextDueDate: parseDate(data.nextDueDate, 'nextDueDate') as Date,
      });

      return normalizeMaintenanceSchedule(schedule, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async getAll(
    domainId: string,
    adminId: string,
    query: PaginationQuery & {
      assetType?: MaintenanceAssetType;
      scheduleStatus?: MaintenanceScheduleStatus;
      vehicleId?: string;
      machineryId?: string;
      searchKey?: string;
      fromDate?: string;
      toDate?: string;
    },
    language: string | null = null,
  ): Promise<PaginatedMaintenanceSchedules> {
    if (!isNonEmptyString(domainId)) throw new Error('invalid domainId');
    if (!isNonEmptyString(adminId)) throw new Error('invalid adminId');
    assertAssetType(query.assetType);
    assertScheduleStatus(query.scheduleStatus);

    const { offset, limit } = normalizePagination(query);

    try {
      const schedules = await maintenanceScheduleRepository.findMany(
        domainId,
        adminId,
        {
          assetType: query.assetType,
          scheduleStatus: query.scheduleStatus,
          vehicleId: query.vehicleId,
          machineryId: query.machineryId,
          searchKey: query.searchKey,
          fromDate: parseDate(query.fromDate, 'fromDate'),
          toDate: parseDate(query.toDate, 'toDate'),
        },
      );

      const paginatedSchedules = schedules.slice(offset, offset + limit);

      return {
        maintenanceSchedules: paginatedSchedules.map((schedule) =>
          normalizeMaintenanceSchedule(schedule, language),
        ),
        pagination: {
          totalCount: schedules.length,
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
  ): Promise<LocalizedMaintenanceScheduleRecord | null> {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(adminId)) throw new Error('invalid adminId');

    try {
      const schedule = await maintenanceScheduleRepository.findById(
        id,
        domainId,
        adminId,
      );

      return schedule ? normalizeMaintenanceSchedule(schedule, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async update(
    id: string,
    domainId: string,
    adminId: string,
    data: ServiceUpdateMaintenanceScheduleInput,
    language: string | null = null,
  ): Promise<LocalizedMaintenanceScheduleRecord | null> {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(adminId)) throw new Error('invalid adminId');
    assertUpdateInput(data);

    try {
      const existing = await maintenanceScheduleRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existing) throw new Error('not found');

      const effectiveAssetType = data.assetType ?? existing.assetType;
      const effectiveVehicleId =
        data.assetType === 'MACHINERY'
          ? null
          : (data.vehicleId ?? existing.vehicleId);
      const effectiveMachineryId =
        data.assetType === 'VEHICLE'
          ? null
          : (data.machineryId ?? existing.machineryId);

      assertAssetSelection(
        effectiveAssetType,
        effectiveVehicleId,
        effectiveMachineryId,
      );
      await assertAssetExists(
        effectiveAssetType,
        domainId,
        adminId,
        effectiveVehicleId,
        effectiveMachineryId,
      );

      if (data.code !== undefined && data.code !== existing.code) {
        const duplicate = await maintenanceScheduleRepository.findByCode(
          data.code,
          domainId,
          adminId,
        );
        if (duplicate && duplicate.id !== id) throw new Error('duplicate code');
      }

      const updateData: UpdateMaintenanceScheduleInput = {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.title !== undefined || data.code !== undefined
          ? {
              searchText: buildSearchText(
                data.code ?? existing.code,
                data.title ?? existing.title,
              ),
            }
          : {}),
        ...(data.assetType !== undefined && { assetType: data.assetType }),
        vehicleId: effectiveVehicleId,
        machineryId: effectiveMachineryId,
        ...(data.nextDueDate !== undefined && {
          nextDueDate: parseDate(data.nextDueDate, 'nextDueDate'),
        }),
        ...(data.scheduleStatus !== undefined && {
          scheduleStatus: data.scheduleStatus,
        }),
        ...(data.status !== undefined && { status: data.status }),
      };

      const schedule = await maintenanceScheduleRepository.update(
        id,
        domainId,
        updateData,
        adminId,
      );

      return schedule ? normalizeMaintenanceSchedule(schedule, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async advance(
    id: string,
    domainId: string,
    adminId: string,
    data: { nextDueDate?: string; scheduleStatus?: MaintenanceScheduleStatus },
    language: string | null = null,
  ): Promise<LocalizedMaintenanceScheduleRecord | null> {
    if (!isNonEmptyString(data.nextDueDate)) {
      throw new Error('nextDueDate is required');
    }

    return maintenanceScheduleService.update(
      id,
      domainId,
      adminId,
      {
        nextDueDate: data.nextDueDate,
        scheduleStatus: data.scheduleStatus ?? 'SCHEDULED',
      },
      language,
    );
  },

  async softDelete(
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<MaintenanceScheduleRecord | null> {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(adminId)) throw new Error('invalid adminId');

    try {
      const existing = await maintenanceScheduleRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existing) throw new Error('not found');

      return maintenanceScheduleRepository.softDelete(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
