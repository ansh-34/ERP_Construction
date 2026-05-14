import { mediaRepository, type MediaRecord } from '@repositories/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { isNonEmptyString, isPlainObject } from '@/utils/validation';

export interface CreateMediaInput {
  name: Record<string, unknown>;
  type: string;
  url: string;
  domainId: string;
}

export interface UpdateMediaInput {
  name?: Record<string, unknown>;
  type?: string;
}

type LocalizedMediaRecord = Omit<MediaRecord, 'name'> & {
  name: string;
};

function buildMediaSearchText(name: Record<string, unknown>): string {
  return Object.values(name).join(' ').toLowerCase();
}

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

function normalizeMedia(
  media: MediaRecord,
  language: string | null,
): LocalizedMediaRecord {
  return {
    ...media,
    name: getLocalizedText(media.name, language),
  };
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function assertCreateInput(data: CreateMediaInput): void {
  if (!isPlainObject(data.name)) {
    throw new Error('invalid name');
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

  if (hasName && !isPlainObject(data.name)) {
    throw new Error('invalid name');
  }

  if (hasName && !isNonEmptyString(data.name?.en)) {
    throw new Error('name.en is required');
  }

  if (hasType && !isNonEmptyString(data.type)) {
    throw new Error('invalid type');
  }
}

export const mediaService = {
  create: async (
    data: CreateMediaInput,
    language: string | null = null,
  ): Promise<LocalizedMediaRecord> => {
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

      return normalizeMedia(media, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    searchKey?: string,
    language: string | null = null,
  ): Promise<LocalizedMediaRecord[]> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    try {
      const media = await mediaRepository.findMany(domainId, searchKey);
      return media.map((item) => normalizeMedia(item, language));
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
    language: string | null = null,
  ): Promise<LocalizedMediaRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const media = await mediaRepository.findById(id, domainId);
      return media ? normalizeMedia(media, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateMediaInput,
    language: string | null = null,
  ): Promise<LocalizedMediaRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingMedia = await mediaRepository.findById(id, domainId);

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

      const media = await mediaRepository.update(id, domainId, updateData);
      return media ? normalizeMedia(media, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<MediaRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const existingMedia = await mediaRepository.findById(id, domainId);

      if (!existingMedia) {
        throw new Error('not found');
      }

      return await mediaRepository.softDelete(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
