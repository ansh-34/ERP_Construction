import { locationRepository, type LocationRecord } from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { isNonEmptyString, isPlainObject } from '@/utils/validation';

export interface CreateLocationInput {
  name: Record<string, unknown>;
  code?: string;
  type: string;
  parentLocationId?: string | null;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateLocationInput {
  name?: Record<string, unknown>;
  code?: string;
  type?: string;
  parentLocationId?: string | null;
  status?: StatusEnum;
}

type LocalizedLocationRecord = Omit<LocationRecord, 'name'> & {
  name: string;
};

function getLocalizedText(
  value: Record<string, unknown>,
  language: string | null,
): string {
  const langCode = language || 'en';
  const localizedValue = value[langCode] ?? value.en ?? '';

  return typeof localizedValue === 'string'
    ? localizedValue
    : String(localizedValue);
}

function normalizeLocation(
  location: LocationRecord,
  language: string | null,
): LocalizedLocationRecord {
  return {
    ...location,
    name: getLocalizedText(location.name, language),
  };
}

function buildLocationCode(name: Record<string, unknown>): string {
  return name.en?.toString().toUpperCase().replace(/\s+/g, '_') || '';
}

function buildLocationSearchText(name: Record<string, unknown>): string {
  return Object.values(name).join(' ').toLowerCase();
}

function assertCreateInput(data: CreateLocationInput): void {
  if (!isPlainObject(data.name)) {
    throw new Error('invalid json name');
  }

  if (!isNonEmptyString(data.name.en)) {
    throw new Error('name.en is required');
  }

  if (!isNonEmptyString(data.type)) {
    throw new Error('invalid type');
  }

  if (!isNonEmptyString(data.domainId)) {
    throw new Error('invalid domainId');
  }

  if (!isNonEmptyString(data.adminId)) {
    throw new Error('invalid adminId');
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
  const hasCode = data.code !== undefined;
  const hasType = data.type !== undefined;
  const hasParentLocationId = data.parentLocationId !== undefined;
  const hasStatus = data.status !== undefined;

  if (!hasName && !hasCode && !hasType && !hasParentLocationId && !hasStatus) {
    throw new Error('empty update payload');
  }

  if (hasName && !isPlainObject(data.name)) {
    throw new Error('invalid json name');
  }

  if (hasName && !isNonEmptyString(data.name?.en)) {
    throw new Error('name.en is required');
  }

  if (hasType && !isNonEmptyString(data.type)) {
    throw new Error('invalid type');
  }

  if (hasCode && !isNonEmptyString(data.code)) {
    throw new Error('invalid code');
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
  create: async (
    data: CreateLocationInput,
    language: string | null = null,
  ): Promise<LocalizedLocationRecord> => {
    assertCreateInput(data);

    try {
      const code = buildLocationCode(data.name);

      if (
        await locationRepository.findByCode(code, data.domainId, data.adminId)
      ) {
        throw new Error('duplicate code');
      }

      if (data.parentLocationId) {
        const parentLocation = await locationRepository.findById(
          data.parentLocationId,
          data.domainId,
          data.adminId,
        );

        if (!parentLocation) {
          throw new Error('not found');
        }
      }

      const location = await locationRepository.create({
        ...data,
        code,
        searchText: buildLocationSearchText(data.name),
      });

      return normalizeLocation(location, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    adminId: string,
    searchKey?: string,
    language: string | null = null,
  ): Promise<LocalizedLocationRecord[]> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    try {
      const locations = await locationRepository.findMany(
        domainId,
        adminId,
        searchKey,
      );
      return locations.map((location) => normalizeLocation(location, language));
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
    adminId: string,
    language: string | null = null,
  ): Promise<LocalizedLocationRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    try {
      const location = await locationRepository.findById(id, domainId, adminId);
      return location ? normalizeLocation(location, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateLocationInput,
    language: string | null = null,
  ): Promise<LocalizedLocationRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    assertUpdateInput(data);

    try {
      const existingLocation = await locationRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingLocation) {
        throw new Error('not found');
      }

      if (data.parentLocationId) {
        const parentLocation = await locationRepository.findById(
          data.parentLocationId,
          domainId,
          adminId,
        );

        if (!parentLocation) {
          throw new Error('not found');
        }
      }

      const updateData = {
        ...data,
        ...(data.code !== undefined ? { code: data.code.toUpperCase() } : {}),
        ...(data.name !== undefined
          ? {
              code: data.code?.toUpperCase() || buildLocationCode(data.name),
              searchText: buildLocationSearchText(data.name),
            }
          : {}),
      };

      if (updateData.code && updateData.code !== existingLocation.code) {
        const duplicateLocation = await locationRepository.findByCode(
          updateData.code,
          domainId,
          adminId,
        );

        if (duplicateLocation && duplicateLocation.id !== id) {
          throw new Error('duplicate code');
        }
      }

      const location = await locationRepository.update(
        id,
        domainId,
        updateData,
        adminId,
      );
      return location ? normalizeLocation(location, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<LocationRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    try {
      const existingLocation = await locationRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingLocation) {
        throw new Error('not found');
      }

      return await locationRepository.softDelete(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
