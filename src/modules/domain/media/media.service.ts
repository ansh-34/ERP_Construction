import {
  mediaRepository,
  type MediaCategory,
  type MediaRecord,
} from '@repositories/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { isNonEmptyString } from '@/utils/validation';

export interface CreateMediaInput {
  name: string;
  type: string;
  url: string;
  domainId: string;
  adminId: string;
}

export interface UpdateMediaInput {
  name?: string;
  type?: string;
}

function buildMediaSearchText(name: string): string {
  return name.toLowerCase();
}

function isValidUrl(value: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function assertCreateInput(data: CreateMediaInput): void {
  if (!isNonEmptyString(data.name)) {
    throw new Error('invalid name');
  }

  if (/[\r\n]/.test(data.name)) {
    throw new Error('name must be single-line');
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

  if (!isNonEmptyString(data.url) || !isValidUrl(data.url)) {
    throw new Error('invalid url');
  }
}

function assertUpdateInput(data: UpdateMediaInput): void {
  const hasName = data.name !== undefined;
  const hasType = data.type !== undefined;

  if (!hasName && !hasType) {
    throw new Error('empty update payload');
  }

  if (hasName && !isNonEmptyString(data.name)) {
    throw new Error('invalid name');
  }

  if (hasName && /[\r\n]/.test(data.name as string)) {
    throw new Error('name must be single-line');
  }

  if (hasType && !isNonEmptyString(data.type)) {
    throw new Error('invalid type');
  }
}

export const mediaService = {
  create: async (
    data: CreateMediaInput,
    _language: string | null = null,
  ): Promise<MediaRecord> => {
    assertCreateInput(data);

    try {
      const existingMedia = await mediaRepository.findByUrl(data.url);

      if (existingMedia) {
        throw new Error('duplicate url');
      }

      const media = await mediaRepository.create({
        ...data,
        searchText: buildMediaSearchText(data.name),
      });

      return media;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    adminId: string,
    searchKey?: string,
    _language: string | null = null,
    type?: string,
    category?: MediaCategory,
  ): Promise<MediaRecord[]> => {
    if (!isNonEmptyString(domainId) || !isNonEmptyString(adminId)) {
      throw new Error('invalid ids');
    }

    try {
      const media = await mediaRepository.findMany(
        domainId,
        adminId,
        searchKey,
        type,
        category,
      );
      return media;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
    adminId: string,
    _language: string | null = null,
  ): Promise<MediaRecord | null> => {
    if (
      !isNonEmptyString(id) ||
      !isNonEmptyString(domainId) ||
      !isNonEmptyString(adminId)
    ) {
      throw new Error('invalid ids');
    }

    try {
      const media = await mediaRepository.findById(id, domainId, adminId);
      return media;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateMediaInput,
    _language: string | null = null,
  ): Promise<MediaRecord | null> => {
    if (
      !isNonEmptyString(id) ||
      !isNonEmptyString(domainId) ||
      !isNonEmptyString(adminId)
    ) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingMedia = await mediaRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingMedia) {
        throw new Error('not found');
      }

      const updateData = {
        ...data,
        ...(data.name !== undefined
          ? {
              searchText: buildMediaSearchText(data.name),
            }
          : {}),
      };

      const media = await mediaRepository.update(
        id,
        domainId,
        adminId,
        updateData,
      );
      return media;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<MediaRecord | null> => {
    if (
      !isNonEmptyString(id) ||
      !isNonEmptyString(domainId) ||
      !isNonEmptyString(adminId)
    ) {
      throw new Error('invalid ids');
    }

    try {
      const existingMedia = await mediaRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingMedia) {
        throw new Error('not found');
      }

      return await mediaRepository.softDelete(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
