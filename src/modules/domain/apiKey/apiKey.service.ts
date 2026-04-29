import {
  apiKeyRepository,
  type ApiKeyPublicRecord,
  type ApiKeyRecord,
} from '@repositories/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { generateSecret } from '@/utils/code';
import { isNonEmptyString } from '@/utils/validation';

export interface CreateApiKeyInput {
  name: string;
  description: string;
  domainId: string;
}

export interface UpdateApiKeyInput {
  name?: string;
  description?: string;
}

function assertCreateInput(data: CreateApiKeyInput): void {
  if (!isNonEmptyString(data.name)) {
    throw new Error('invalid name');
  }

  if (!isNonEmptyString(data.description)) {
    throw new Error('invalid description');
  }

  if (!isNonEmptyString(data.domainId)) {
    throw new Error('invalid domainId');
  }
}

function assertUpdateInput(data: UpdateApiKeyInput): void {
  const hasName = data.name !== undefined;
  const hasDescription = data.description !== undefined;

  if (!hasName && !hasDescription) {
    throw new Error('empty update payload');
  }

  if (hasName && !isNonEmptyString(data.name)) {
    throw new Error('invalid name');
  }

  if (hasDescription && !isNonEmptyString(data.description)) {
    throw new Error('invalid description');
  }
}

export const apiKeyService = {
  create: async (data: CreateApiKeyInput): Promise<ApiKeyRecord> => {
    assertCreateInput(data);

    try {
      return await apiKeyRepository.create({
        ...data,
        secret: generateSecret(),
      });
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (domainId: string): Promise<ApiKeyPublicRecord[]> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    try {
      return await apiKeyRepository.findMany(domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
  ): Promise<ApiKeyPublicRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      return await apiKeyRepository.findById(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateApiKeyInput,
  ): Promise<ApiKeyPublicRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingApiKey = await apiKeyRepository.findById(id, domainId);

      if (!existingApiKey) {
        throw new Error('not found');
      }

      return await apiKeyRepository.update(id, domainId, data);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  delete: async (
    id: string,
    domainId: string,
  ): Promise<ApiKeyPublicRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const existingApiKey = await apiKeyRepository.findById(id, domainId);

      if (!existingApiKey) {
        throw new Error('not found');
      }

      return await apiKeyRepository.softDelete(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
