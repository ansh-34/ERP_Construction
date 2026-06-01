import {
  machineryRepository,
  projectRepository,
  type MachineryRecord,
  type UpdateMachineryInput,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import {
  isNonEmptyString,
  isNonNegativeFiniteNumber,
} from '@/utils/validation';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';

export interface CreateMachineryInput {
  code: string;
  type: string;
  expectedLitrePerHour?: number;
  projectId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

type LocalizedText = string | Record<string, unknown>;

type LocalizedMachineryRecord = Omit<MachineryRecord, 'type'> & {
  type: LocalizedText;
  project?: (Record<string, unknown> & { name?: LocalizedText }) | null;
};

function buildMachinerySearchText(type: string): string {
  return type.toLowerCase();
}

function getLocalizedText(
  value: string | Record<string, unknown>,
  language: string | null,
): LocalizedText {
  if (typeof value === 'string') {
    return value;
  }

  if (!language) {
    return value;
  }

  const localizedValue = value[language] ?? value.en ?? '';

  return typeof localizedValue === 'string'
    ? localizedValue
    : String(localizedValue);
}

function normalizeMachinery(
  machinery: MachineryRecord,
  language: string | null,
): LocalizedMachineryRecord {
  return {
    ...machinery,
    type: getLocalizedText(machinery.type, language),
    ...(machinery.project && {
      project: {
        ...machinery.project,
        ...(machinery.project.name !== undefined && {
          name: getLocalizedText(
            machinery.project.name as string | Record<string, unknown>,
            language,
          ),
        }),
      },
    }),
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

function assertCreateInput(data: CreateMachineryInput): void {
  if (!isNonEmptyString(data.code)) {
    throw new Error('invalid code');
  }

  if (!isNonEmptyString(data.type)) {
    throw new Error('invalid type');
  }

  if (
    data.expectedLitrePerHour !== undefined &&
    !isNonNegativeFiniteNumber(data.expectedLitrePerHour)
  ) {
    throw new Error('invalid expectedLitrePerHour');
  }

  if (!isNonEmptyString(data.projectId)) {
    throw new Error('invalid projectId');
  }

  if (!isNonEmptyString(data.domainId)) {
    throw new Error('invalid domainId');
  }

  if (!isNonEmptyString(data.adminId)) {
    throw new Error('invalid adminId');
  }

  assertStatus(data.status);
}

function assertUpdateInput(data: UpdateMachineryInput): void {
  const hasAnyField = Object.values(data).some((value) => value !== undefined);

  if (!hasAnyField) {
    throw new Error('empty update payload');
  }

  if (data.code !== undefined && !isNonEmptyString(data.code)) {
    throw new Error('invalid code');
  }

  if (data.type !== undefined && !isNonEmptyString(data.type)) {
    throw new Error('invalid type');
  }

  if (
    data.expectedLitrePerHour !== undefined &&
    !isNonNegativeFiniteNumber(data.expectedLitrePerHour)
  ) {
    throw new Error('invalid expectedLitrePerHour');
  }

  assertStatus(data.status);
}

export const machineryService = {
  create: async (
    data: CreateMachineryInput,
    language: string | null = null,
  ): Promise<LocalizedMachineryRecord> => {
    assertCreateInput(data);

    try {
      const project = await projectRepository.findById(
        data.projectId,
        data.domainId,
        data.adminId,
      );

      if (!project) {
        throw new Error('not found');
      }

      const machinery = await machineryRepository.create({
        ...data,
        searchText: buildMachinerySearchText(data.type),
      });

      return normalizeMachinery(machinery, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    adminId: string,
    projectId?: string,
    searchKey?: string,
    paginationQuery: PaginationQuery = {},
    language: string | null = null,
  ): Promise<{
    machineries: LocalizedMachineryRecord[];
    pagination: { totalCount: number; offset: number; limit: number };
  }> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    if (projectId !== undefined && !isNonEmptyString(projectId)) {
      throw new Error('invalid projectId');
    }

    try {
      const { offset, limit } = normalizePagination(paginationQuery);
      const [machineries, totalCount] = await Promise.all([
        machineryRepository.findMany(
          domainId,
          adminId,
          projectId,
          searchKey,
          offset,
          limit,
        ),
        machineryRepository.count(domainId, adminId, projectId, searchKey),
      ]);
      return {
        machineries: machineries.map((machinery) =>
          normalizeMachinery(machinery, language),
        ),
        pagination: { totalCount, offset, limit },
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
    adminId: string,
    language: string | null = null,
  ): Promise<LocalizedMachineryRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    try {
      const machinery = await machineryRepository.findById(
        id,
        domainId,
        adminId,
      );
      return machinery ? normalizeMachinery(machinery, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateMachineryInput,
    language: string | null = null,
  ): Promise<LocalizedMachineryRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    assertUpdateInput(data);

    try {
      const existingMachinery = await machineryRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingMachinery) {
        throw new Error('not found');
      }

      const updateData = {
        ...data,
        ...(data.type !== undefined
          ? {
              searchText: buildMachinerySearchText(data.type),
            }
          : {}),
      };

      const machinery = await machineryRepository.update(
        id,
        domainId,
        updateData,
        adminId,
      );
      return machinery ? normalizeMachinery(machinery, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<MachineryRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    try {
      const existingMachinery = await machineryRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingMachinery) {
        throw new Error('not found');
      }

      return await machineryRepository.softDelete(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
