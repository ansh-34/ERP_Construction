import {
  machineryInventoryLogRepository,
  machineryInventoryRepository,
  machineryRepository,
  uomRepository,
  type MachineryInventoryLogFilters,
  type MachineryInventoryTransactionType,
  type CreateMachineryInventoryLogInput,
  type UpdateMachineryInventoryLogInput,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import { normalizePrismaError } from '@/utils/prismaError';
import { isNonEmptyString, isPositiveFiniteNumber } from '@/utils/validation';

type MachineryInventoryLogRecord = Awaited<
  ReturnType<typeof machineryInventoryLogRepository.findById>
>;

type PaginatedMachineryInventoryLogs = {
  machineryInventoryLogs: Awaited<
    ReturnType<typeof machineryInventoryLogRepository.findMany>
  >;
  pagination: {
    totalCount: number;
    currentCount: number;
    offset: number;
    limit: number;
  };
};

interface CreateLogInput {
  date: string;
  transactionType: MachineryInventoryTransactionType;
  name: string;
  notes?: string | null;
  quantity: number;
  restockLevel?: number;
  machineryInventoryId?: string;
  machineId: string;
  uomId: string;
  domainId: string;
  adminId: string;
  status?: StatusEnum;
}

type UpdateLogInput = Omit<Partial<CreateLogInput>, 'domainId' | 'adminId'> & {
  status?: StatusEnum;
};

function parseDate(value: string, field: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`invalid ${field}`);
  return date;
}

function buildSearchText(data: {
  name?: string;
  transactionType?: string;
  notes?: string | null;
}) {
  return [data.name, data.transactionType, data.notes]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function assertCreateInput(data: CreateLogInput): void {
  if (!isNonEmptyString(data.domainId)) throw new Error('invalid domainId');
  if (!isNonEmptyString(data.adminId)) throw new Error('invalid adminId');
  if (!isNonEmptyString(data.date)) throw new Error('date is required');
  if (!['INWARD', 'OUTWARD'].includes(data.transactionType)) {
    throw new Error('invalid transactionType');
  }
  if (!isNonEmptyString(data.name)) throw new Error('name is required');
  if (!isPositiveFiniteNumber(data.quantity)) {
    throw new Error('invalid quantity');
  }
  if (!isNonEmptyString(data.machineId)) throw new Error('invalid machineId');
  if (!isNonEmptyString(data.uomId)) throw new Error('invalid uomId');
}

async function assertRelationsExist(data: {
  machineId?: string;
  uomId?: string;
  machineryInventoryId?: string;
  domainId: string;
  adminId: string;
}) {
  if (data.machineId) {
    const machinery = await machineryRepository.findById(
      data.machineId,
      data.domainId,
      data.adminId,
    );
    if (!machinery) throw new Error('invalid machineId');
  }

  if (data.uomId) {
    const uom = await uomRepository.findByIdAndDomain(
      data.uomId,
      data.domainId,
    );
    if (!uom) throw new Error('invalid uomId');
  }

  if (data.machineryInventoryId) {
    const inventory = await machineryInventoryRepository.findById(
      data.machineryInventoryId,
      data.domainId,
      data.adminId,
    );
    if (!inventory) throw new Error('Machinery inventory not found');
  }
}

export const machineryInventoryLogService = {
  async create(data: CreateLogInput): Promise<MachineryInventoryLogRecord> {
    assertCreateInput(data);

    try {
      await assertRelationsExist(data);

      const createInput: CreateMachineryInventoryLogInput = {
        date: parseDate(data.date, 'date'),
        transactionType: data.transactionType,
        name: data.name.trim(),
        searchText: buildSearchText(data),
        notes: data.notes ?? null,
        quantity: data.quantity,
        restockLevel: data.restockLevel,
        machineryInventoryId: data.machineryInventoryId,
        machineId: data.machineId,
        uomId: data.uomId,
        domainId: data.domainId,
        adminId: data.adminId,
        status: data.status ?? StatusEnum.ACTIVE,
      };

      return await machineryInventoryLogRepository.create(createInput);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async getAll(
    domainId: string,
    adminId: string,
    query: PaginationQuery &
      MachineryInventoryLogFilters & {
        fromDate?: string;
        toDate?: string;
      },
  ): Promise<PaginatedMachineryInventoryLogs> {
    if (!isNonEmptyString(domainId)) throw new Error('invalid domainId');
    if (!isNonEmptyString(adminId)) throw new Error('invalid adminId');

    try {
      const { offset, limit } = normalizePagination(query);
      const filters = {
        machineryInventoryId: query.machineryInventoryId,
        machineId: query.machineId,
        uomId: query.uomId,
        transactionType: query.transactionType,
        status: query.status,
        searchKey: query.searchKey,
        fromDate:
          typeof query.fromDate === 'string'
            ? parseDate(query.fromDate, 'fromDate')
            : query.fromDate,
        toDate:
          typeof query.toDate === 'string'
            ? parseDate(query.toDate, 'toDate')
            : query.toDate,
      };

      const [totalCount, machineryInventoryLogs] = await Promise.all([
        machineryInventoryLogRepository.count(domainId, adminId, filters),
        machineryInventoryLogRepository.findMany(
          domainId,
          adminId,
          filters,
          offset,
          limit,
        ),
      ]);

      return {
        machineryInventoryLogs,
        pagination: {
          totalCount,
          currentCount: machineryInventoryLogs.length,
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
  ): Promise<MachineryInventoryLogRecord> {
    if (!isNonEmptyString(id)) throw new Error('invalid id');

    try {
      return await machineryInventoryLogRepository.findById(
        id,
        domainId,
        adminId,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async update(
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateLogInput,
  ): Promise<MachineryInventoryLogRecord> {
    if (!isNonEmptyString(id)) throw new Error('invalid id');
    if (Object.keys(data).length === 0) throw new Error('empty update payload');

    try {
      await assertRelationsExist({
        machineId: data.machineId,
        uomId: data.uomId,
        machineryInventoryId: data.machineryInventoryId,
        domainId,
        adminId,
      });

      const updateInput: UpdateMachineryInventoryLogInput = {
        ...(data.date ? { date: parseDate(data.date, 'date') } : {}),
        ...(data.transactionType
          ? { transactionType: data.transactionType }
          : {}),
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(Object.prototype.hasOwnProperty.call(data, 'notes')
          ? { notes: data.notes ?? null }
          : {}),
        ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
        ...(data.restockLevel !== undefined
          ? { restockLevel: data.restockLevel }
          : {}),
        ...(data.machineryInventoryId
          ? { machineryInventoryId: data.machineryInventoryId }
          : {}),
        ...(data.machineId ? { machineId: data.machineId } : {}),
        ...(data.uomId ? { uomId: data.uomId } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.name !== undefined ||
        data.transactionType !== undefined ||
        Object.prototype.hasOwnProperty.call(data, 'notes')
          ? { searchText: buildSearchText(data) }
          : {}),
      };

      return await machineryInventoryLogRepository.update(
        id,
        domainId,
        adminId,
        updateInput,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async softDelete(
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<MachineryInventoryLogRecord> {
    if (!isNonEmptyString(id)) throw new Error('invalid id');

    try {
      return await machineryInventoryLogRepository.softDelete(
        id,
        domainId,
        adminId,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
