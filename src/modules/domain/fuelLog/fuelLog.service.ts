import {
  fuelLogRepository,
  uomRepository,
  projectRepository,
  type FuelType,
  type FuelDirectionType,
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
const equipmentCategories: MaintenanceAssetType[] = ['VEHICLE', 'MACHINERY'];

interface CreateFuelLogInput {
  fuelType: FuelType;
  equipmentUniqueId: string;
  equipmentCategory: MaintenanceAssetType;
  equipmentType: string;
  date: string;
  fuelDirectionType: FuelDirectionType;
  fuelValue: number;
  fuelQuantity: number;
  fuelUomId: string;
  projectId: string;
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
    data.fuelDirectionType,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function assertCreateInput(data: CreateFuelLogInput): void {
  if (!fuelTypes.includes(data.fuelType)) throw new Error('invalid fuelType');
  if (!isNonEmptyString(data.equipmentUniqueId))
    throw new Error('invalid equipmentUniqueId');
  if (!equipmentCategories.includes(data.equipmentCategory))
    throw new Error('invalid equipmentCategory');
  if (!isNonEmptyString(data.equipmentType))
    throw new Error('invalid equipmentType');
  if (!isNonEmptyString(data.date)) throw new Error('date is required');
  if (!fuelDirectionTypes.includes(data.fuelDirectionType))
    throw new Error('invalid fuelDirectionType');
  if (!isNonNegativeFiniteNumber(data.fuelValue))
    throw new Error('invalid fuelValue');
  if (!isNonNegativeFiniteNumber(data.fuelQuantity))
    throw new Error('invalid fuelQuantity');
  if (!isNonEmptyString(data.fuelUomId)) throw new Error('invalid fuelUomId');
  if (!isNonEmptyString(data.domainId)) throw new Error('invalid domainId');
  if (!isNonEmptyString(data.adminId)) throw new Error('invalid adminId');
}

async function assertRelationsExist(data: CreateFuelLogInput): Promise<void> {
  const uom = await uomRepository.findByIdAndDomain(
    data.fuelUomId,
    data.domainId,
  );
  if (!uom) throw new Error('invalid fuelUomId');

  if (data.projectId) {
    const project = await projectRepository.findById(
      data.projectId,
      data.domainId,
      data.adminId,
    );
    if (!project) throw new Error('invalid projectId');
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
        equipmentUniqueId: data.equipmentUniqueId,
        equipmentCategory: data.equipmentCategory,
        equipmentType: data.equipmentType,
        date,
        fuelDirectionType: data.fuelDirectionType,
        fuelValue: data.fuelValue,
        fuelQuantity: data.fuelQuantity,
        searchText: buildSearchText(data),
        fuelUomId: data.fuelUomId,
        projectId: data.projectId,
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
        data.fuelDirectionType ?? existing.fuelDirectionType,
      ]
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
