import {
  fuelLogRepository,
  uomRepository,
  projectRepository,
  VehicleRepository,
  machineryRepository,
  type FuelType,
  type FuelDirectionType,
  type FuelTransactionType,
  type FuelEntityType,
  type MaintenanceAssetType,
  type UpdateFuelLogInput,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import {
  isNonEmptyString,
  isNonNegativeFiniteNumber,
} from '@/utils/validation';

type FuelLogRecord = Awaited<ReturnType<typeof fuelLogRepository.findById>>;

const fuelTypes: FuelType[] = ['PETROL', 'DIESEL'];
const fuelDirectionTypes: FuelDirectionType[] = ['CONSUMED', 'FILLED'];
const fuelTransactionTypes: FuelTransactionType[] = ['REFILL', 'CONSUMED'];
const fuelEntityTypes: FuelEntityType[] = [
  'PROJECT_FUEL_TANK',
  'VEHICLE',
  'MACHINERY',
];
const equipmentCategories: MaintenanceAssetType[] = ['VEHICLE', 'MACHINERY'];

interface CreateFuelLogInput {
  fuelType: FuelType;
  equipmentUniqueId?: string | null;
  equipmentCategory?: MaintenanceAssetType | null;
  equipmentType?: string | null;
  date: string;
  fuelDirectionType?: FuelDirectionType;
  transactionType: FuelTransactionType;
  fuelEntityType: FuelEntityType;
  fuelValue?: number;
  fuelQuantity: number;
  fuelUomId: string;
  projectId: string;
  vehicleId?: string | null;
  machineryId?: string | null;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

type PaginatedFuelLogs = {
  fuelLogs: FuelLogRecord[];
  pagination: {
    totalCount: number;
    currentCount: number;
    offset: number;
    limit: number;
  };
};

function parseDate(value: string, field: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`invalid ${field}`);
  return date;
}

function buildSearchText(data: CreateFuelLogInput): string {
  return [
    data.fuelType,
    data.equipmentUniqueId,
    data.equipmentCategory,
    data.equipmentType,
    data.transactionType,
    data.fuelEntityType,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function assertCreateInput(data: CreateFuelLogInput): void {
  if (!fuelTypes.includes(data.fuelType)) throw new Error('invalid fuelType');
  if (
    data.equipmentCategory !== undefined &&
    data.equipmentCategory !== null &&
    !equipmentCategories.includes(data.equipmentCategory)
  ) {
    throw new Error('invalid equipmentCategory');
  }
  if (!isNonEmptyString(data.date)) throw new Error('date is required');
  if (
    data.fuelDirectionType !== undefined &&
    !fuelDirectionTypes.includes(data.fuelDirectionType)
  ) {
    throw new Error('invalid fuelDirectionType');
  }
  if (!fuelTransactionTypes.includes(data.transactionType)) {
    throw new Error('invalid transactionType');
  }
  if (!fuelEntityTypes.includes(data.fuelEntityType)) {
    throw new Error('invalid fuelEntityType');
  }
  if (
    data.fuelValue !== undefined &&
    !isNonNegativeFiniteNumber(data.fuelValue)
  ) {
    throw new Error('invalid fuelValue');
  }
  if (!isNonNegativeFiniteNumber(data.fuelQuantity) || data.fuelQuantity <= 0) {
    throw new Error('invalid fuelQuantity');
  }
  if (!isNonEmptyString(data.fuelUomId)) throw new Error('invalid fuelUomId');
  if (!isNonEmptyString(data.projectId)) throw new Error('invalid projectId');
  if (!isNonEmptyString(data.domainId)) throw new Error('invalid domainId');
  if (!isNonEmptyString(data.adminId)) throw new Error('invalid adminId');

  if (
    data.transactionType === 'REFILL' &&
    data.fuelEntityType !== 'PROJECT_FUEL_TANK'
  ) {
    throw new Error('REFILL must use PROJECT_FUEL_TANK');
  }

  if (
    data.transactionType === 'CONSUMED' &&
    data.fuelEntityType === 'PROJECT_FUEL_TANK'
  ) {
    throw new Error('CONSUMED must use VEHICLE or MACHINERY');
  }

  if (data.fuelEntityType === 'VEHICLE' && !isNonEmptyString(data.vehicleId)) {
    throw new Error('vehicleId is required');
  }

  if (
    data.fuelEntityType === 'MACHINERY' &&
    !isNonEmptyString(data.machineryId)
  ) {
    throw new Error('machineryId is required');
  }
}

async function assertRelationsExist(data: CreateFuelLogInput): Promise<void> {
  const uom = await uomRepository.findByIdAndDomain(
    data.fuelUomId,
    data.domainId,
  );
  if (!uom) throw new Error('invalid fuelUomId');

  const project = await projectRepository.findById(
    data.projectId,
    data.domainId,
    data.adminId,
  );
  if (!project) throw new Error('invalid projectId');

  if (data.vehicleId) {
    const vehicle = await VehicleRepository.findActiveByIdAndDomain(
      data.vehicleId,
      data.domainId,
    );
    if (!vehicle) throw new Error('invalid vehicleId');
  }

  if (data.machineryId) {
    const machinery = await machineryRepository.findById(
      data.machineryId,
      data.domainId,
      data.adminId,
    );
    if (!machinery) throw new Error('invalid machineryId');
  }
}

export const FuelLogService = {
  async create(data: CreateFuelLogInput): Promise<FuelLogRecord> {
    assertCreateInput(data);

    try {
      await assertRelationsExist(data);

      const date = parseDate(data.date, 'date');

      return await fuelLogRepository.create({
        fuelType: data.fuelType,
        equipmentUniqueId: data.equipmentUniqueId ?? null,
        equipmentCategory: data.equipmentCategory ?? null,
        equipmentType: data.equipmentType ?? null,
        date,
        fuelDirectionType:
          data.fuelDirectionType ??
          (data.transactionType === 'REFILL' ? 'FILLED' : 'CONSUMED'),
        fuelValue: data.fuelValue ?? 0,
        fuelQuantity: data.fuelQuantity,
        transactionType: data.transactionType,
        fuelEntityType: data.fuelEntityType,
        searchText: buildSearchText(data),
        fuelUomId: data.fuelUomId,
        projectId: data.projectId,
        vehicleId: data.fuelEntityType === 'VEHICLE' ? data.vehicleId : null,
        machineryId:
          data.fuelEntityType === 'MACHINERY' ? data.machineryId : null,
        domainId: data.domainId,
        adminId: data.adminId,
        status: data.status,
      });
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async getAll(
    domainId: string,
    adminId: string,
    query: PaginationQuery & {
      fuelType?: FuelType;
      equipmentCategory?: MaintenanceAssetType;
      fuelDirectionType?: FuelDirectionType;
      transactionType?: FuelTransactionType;
      fuelEntityType?: FuelEntityType;
      equipmentUniqueId?: string;
      projectId?: string;
      fromDate?: string;
      toDate?: string;
      searchKey?: string;
    },
  ): Promise<PaginatedFuelLogs> {
    try {
      const { offset, limit } = normalizePagination(query);

      const filters = {
        fuelType: query.fuelType,
        equipmentCategory: query.equipmentCategory,
        fuelDirectionType: query.fuelDirectionType,
        transactionType: query.transactionType,
        fuelEntityType: query.fuelEntityType,
        equipmentUniqueId: query.equipmentUniqueId,
        projectId: query.projectId,
        fromDate: query.fromDate
          ? parseDate(query.fromDate, 'fromDate')
          : undefined,
        toDate: query.toDate ? parseDate(query.toDate, 'toDate') : undefined,
        searchKey: query.searchKey,
      };

      const [totalCount, fuelLogs] = await Promise.all([
        fuelLogRepository.count(domainId, adminId, filters),
        fuelLogRepository.findMany(domainId, adminId, filters, offset, limit),
      ]);

      return {
        fuelLogs,
        pagination: {
          totalCount,
          currentCount: fuelLogs.length,
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
  ): Promise<FuelLogRecord | null> {
    if (!isNonEmptyString(id)) throw new Error('invalid id');

    try {
      return await fuelLogRepository.findById(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async update(
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateFuelLogInput & { date?: string },
  ) {
    if (!isNonEmptyString(id)) throw new Error('invalid id');
    if (Object.keys(data).length === 0) throw new Error('empty update payload');

    try {
      const existing = await fuelLogRepository.findById(id, domainId, adminId);
      if (!existing) return null;

      if (data.fuelUomId) {
        const uom = await uomRepository.findByIdAndDomain(
          data.fuelUomId,
          domainId,
        );
        if (!uom) throw new Error('invalid fuelUomId');
      }

      if (data.projectId) {
        const project = await projectRepository.findById(
          data.projectId,
          domainId,
          adminId,
        );
        if (!project) throw new Error('invalid projectId');
      }

      const parsedDate = data.date ? parseDate(data.date, 'date') : undefined;

      const searchText = [
        data.fuelType ?? existing.fuelType,
        data.equipmentUniqueId ?? existing.equipmentUniqueId,
        data.equipmentCategory ?? existing.equipmentCategory,
        data.equipmentType ?? existing.equipmentType,
        data.transactionType ?? existing.transactionType,
        data.fuelEntityType ?? existing.fuelEntityType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return await fuelLogRepository.update(
        id,
        domainId,
        {
          ...data,
          ...(parsedDate ? { date: parsedDate } : {}),
          searchText,
        },
        adminId,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async softDelete(
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<FuelLogRecord | null> {
    const existing = await FuelLogService.getById(id, domainId, adminId);
    if (!existing) return null;

    try {
      await fuelLogRepository.softDelete(id, domainId, adminId);
      return existing;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
