import { mediaRepository, type MediaRecord } from '@repositories/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { isNonEmptyString } from '@/utils/validation';

export interface CreateMediaInput {
  name: string;
  type: string;
  url: string;
  domainId: string;
}

export interface UpdateMediaInput {
  name?: string;
  type?: string;
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

  if (hasName && !isNonEmptyString(data.name)) {
    throw new Error('invalid name');
  }

  if (hasType && !isNonEmptyString(data.type)) {
    throw new Error('invalid type');
  }
}

export const mediaService = {
  create: async (data: CreateMediaInput): Promise<MediaRecord> => {
    assertCreateInput(data);

    try {
      const existingMedia = await mediaRepository.findByUrl(data.url);

      if (existingMedia) {
        throw new Error('duplicate url');
      }

      return await mediaRepository.create(data);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (domainId: string): Promise<MediaRecord[]> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    try {
      return await mediaRepository.findMany(domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
  ): Promise<MediaRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      return await mediaRepository.findById(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateMediaInput,
  ): Promise<MediaRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingMedia = await mediaRepository.findById(id, domainId);

      if (!existingMedia) {
        throw new Error('not found');
      }

      return await mediaRepository.update(id, domainId, data);
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
