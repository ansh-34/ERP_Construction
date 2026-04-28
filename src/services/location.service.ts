import { locationRepository, type LocationRecord } from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { generateCode } from '@/utils/code';
import { isNonEmptyString, isPlainObject } from '@/utils/validation';

export interface CreateLocationInput {
  name: Record<string, unknown>;
  type: string;
  parentLocationId?: string | null;
  domainId: string;
  status: StatusEnum;
}

export interface UpdateLocationInput {
  name?: Record<string, unknown>;
  type?: string;
  parentLocationId?: string | null;
  status?: StatusEnum;
}

function assertCreateInput(data: CreateLocationInput): void {
  if (!isPlainObject(data.name)) {
    throw new Error('invalid json name');
  }

  if (!isNonEmptyString(data.type)) {
    throw new Error('invalid type');
  }

  if (!isNonEmptyString(data.domainId)) {
    throw new Error('invalid domainId');
  }

  if (
    data.parentLocationId !== undefined &&
    data.parentLocationId !== null &&
    !isNonEmptyString(data.parentLocationId)
  ) {
    throw new Error('invalid parentLocationId');
  }

  if (
    data.status !== StatusEnum.ACTIVE &&
    data.status !== StatusEnum.INACTIVE
  ) {
    throw new Error('invalid status');
  }
}

function assertUpdateInput(data: UpdateLocationInput): void {
  const hasName = data.name !== undefined;
  const hasType = data.type !== undefined;
  const hasParentLocationId = data.parentLocationId !== undefined;
  const hasStatus = data.status !== undefined;

  if (!hasName && !hasType && !hasParentLocationId && !hasStatus) {
    throw new Error('empty update payload');
  }

  if (hasName && !isPlainObject(data.name)) {
    throw new Error('invalid json name');
  }

  if (hasType && !isNonEmptyString(data.type)) {
    throw new Error('invalid type');
  }

  if (
    hasParentLocationId &&
    data.parentLocationId !== null &&
    !isNonEmptyString(data.parentLocationId)
  ) {
    throw new Error('invalid parentLocationId');
  }

  if (
    hasStatus &&
    data.status !== StatusEnum.ACTIVE &&
    data.status !== StatusEnum.INACTIVE
  ) {
    throw new Error('invalid status');
  }
}

export const locationService = {
  create: async (data: CreateLocationInput): Promise<LocationRecord> => {
    assertCreateInput(data);

    try {
      let code = generateCode('LOCATION');

      while (await locationRepository.findByCode(code, data.domainId)) {
        code = generateCode('LOCATION');
      }

      if (data.parentLocationId) {
        const parentLocation = await locationRepository.findById(
          data.parentLocationId,
          data.domainId,
        );

        if (!parentLocation) {
          throw new Error('not found');
        }
      }

      return await locationRepository.create({
        ...data,
        code,
      });
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (domainId: string): Promise<LocationRecord[]> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    try {
      return await locationRepository.findMany(domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
  ): Promise<LocationRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      return await locationRepository.findById(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateLocationInput,
  ): Promise<LocationRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingLocation = await locationRepository.findById(id, domainId);

      if (!existingLocation) {
        throw new Error('not found');
      }

      if (data.parentLocationId) {
        const parentLocation = await locationRepository.findById(
          data.parentLocationId,
          domainId,
        );

        if (!parentLocation) {
          throw new Error('not found');
        }
      }

      return await locationRepository.update(id, domainId, data);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<LocationRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const existingLocation = await locationRepository.findById(id, domainId);

      if (!existingLocation) {
        throw new Error('not found');
      }

      return await locationRepository.softDelete(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
