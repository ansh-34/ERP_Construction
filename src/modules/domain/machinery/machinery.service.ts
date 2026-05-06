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

export interface CreateMachineryInput {
  code: string;
  type: string;
  expectedLitrePerHour: number;
  projectId: string;
  domainId: string;
  status: StatusEnum;
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

  if (!isNonNegativeFiniteNumber(data.expectedLitrePerHour)) {
    throw new Error('invalid expectedLitrePerHour');
  }

  if (!isNonEmptyString(data.projectId)) {
    throw new Error('invalid projectId');
  }

  if (!isNonEmptyString(data.domainId)) {
    throw new Error('invalid domainId');
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
  create: async (data: CreateMachineryInput): Promise<MachineryRecord> => {
    assertCreateInput(data);

    try {
      const project = await projectRepository.findById(
        data.projectId,
        data.domainId,
      );

      if (!project) {
        throw new Error('not found');
      }

      return await machineryRepository.create(data);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    projectId?: string,
  ): Promise<MachineryRecord[]> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    if (projectId !== undefined && !isNonEmptyString(projectId)) {
      throw new Error('invalid projectId');
    }

    try {
      return await machineryRepository.findMany(domainId, projectId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
  ): Promise<MachineryRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      return await machineryRepository.findById(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateMachineryInput,
  ): Promise<MachineryRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingMachinery = await machineryRepository.findById(
        id,
        domainId,
      );

      if (!existingMachinery) {
        throw new Error('not found');
      }

      return await machineryRepository.update(id, domainId, data);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<MachineryRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const existingMachinery = await machineryRepository.findById(
        id,
        domainId,
      );

      if (!existingMachinery) {
        throw new Error('not found');
      }

      return await machineryRepository.softDelete(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
