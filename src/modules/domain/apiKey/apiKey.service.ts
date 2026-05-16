import {
  apiKeyRepository,
  type ApiKeyPublicRecord,
  type ApiKeyRecord,
} from '@repositories/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { generateSecret } from '@/utils/code';
import { isNonEmptyString, isPlainObject } from '@/utils/validation';

export interface CreateApiKeyInput {
  name: Record<string, unknown>;
  description: Record<string, unknown>;
  domainId: string;
  adminId: string;
}

export interface UpdateApiKeyInput {
  name?: Record<string, unknown>;
  description?: Record<string, unknown>;
}

type LocalizedApiKeyPublicRecord = Omit<
  ApiKeyPublicRecord,
  'name' | 'description'
> & {
  name: string;
  description: string;
};

type LocalizedApiKeyRecord = Omit<ApiKeyRecord, 'name' | 'description'> & {
  name: string;
  description: string;
};

function buildApiKeySearchText(name: Record<string, unknown>): string {
  return Object.values(name).join(' ').toLowerCase();
}

function getLocalizedText(
  value: Record<string, unknown> | null,
  language: string | null,
): string {
  if (!value) {
    return '';
  }

  const langCode = language || 'en';
  const localizedValue = value[langCode] ?? value.en ?? '';

  return typeof localizedValue === 'string'
    ? localizedValue
    : String(localizedValue);
}

function normalizeApiKeyRecord<T extends ApiKeyPublicRecord | ApiKeyRecord>(
  apiKey: T,
  language: string | null,
): Omit<T, 'name' | 'description'> & { name: string; description: string } {
  return {
    ...apiKey,
    name: getLocalizedText(apiKey.name, language),
    description: getLocalizedText(apiKey.description, language),
  };
}

function assertCreateInput(data: CreateApiKeyInput): void {
  if (!isPlainObject(data.name)) {
    throw new Error('invalid name');
  }

  if (!isNonEmptyString(data.name.en)) {
    throw new Error('name.en is required');
  }

  if (!isPlainObject(data.description)) {
    throw new Error('invalid description');
  }

  if (!isNonEmptyString(data.description.en)) {
    throw new Error('description.en is required');
  }

  if (!isNonEmptyString(data.domainId)) {
    throw new Error('invalid domainId');
  }

  if (!isNonEmptyString(data.adminId)) {
    throw new Error('invalid adminId');
  }
}

function assertUpdateInput(data: UpdateApiKeyInput): void {
  const hasName = data.name !== undefined;
  const hasDescription = data.description !== undefined;

  if (!hasName && !hasDescription) {
    throw new Error('empty update payload');
  }

  if (hasName && !isPlainObject(data.name)) {
    throw new Error('invalid name');
  }

  if (hasName && !isNonEmptyString(data.name?.en)) {
    throw new Error('name.en is required');
  }

  if (hasDescription && !isPlainObject(data.description)) {
    throw new Error('invalid description');
  }

  if (hasDescription && !isNonEmptyString(data.description?.en)) {
    throw new Error('description.en is required');
  }
}

export const apiKeyService = {
  create: async (
    data: CreateApiKeyInput,
    language: string | null = null,
  ): Promise<LocalizedApiKeyRecord> => {
    assertCreateInput(data);

    try {
      const apiKey = await apiKeyRepository.create({
        ...data,
        secret: generateSecret(),
        searchText: buildApiKeySearchText(data.name),
      });

      return normalizeApiKeyRecord(apiKey, language) as LocalizedApiKeyRecord;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    adminId: string,
    searchKey?: string,
    language: string | null = null,
  ): Promise<LocalizedApiKeyPublicRecord[]> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    try {
      const apiKeys = await apiKeyRepository.findMany(
        domainId,
        adminId,
        searchKey,
      );
      return apiKeys.map((apiKey) =>
        normalizeApiKeyRecord(apiKey, language),
      ) as LocalizedApiKeyPublicRecord[];
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
    adminId: string,
    language: string | null = null,
  ): Promise<LocalizedApiKeyPublicRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    try {
      const apiKey = await apiKeyRepository.findById(id, domainId, adminId);
      return apiKey
        ? (normalizeApiKeyRecord(
            apiKey,
            language,
          ) as LocalizedApiKeyPublicRecord)
        : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateApiKeyInput,
    language: string | null = null,
  ): Promise<LocalizedApiKeyPublicRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    assertUpdateInput(data);

    try {
      const existingApiKey = await apiKeyRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingApiKey) {
        throw new Error('not found');
      }

      const updateData = {
        ...data,
        ...(data.name !== undefined
          ? {
              searchText: buildApiKeySearchText(data.name),
            }
          : {}),
      };

      const apiKey = await apiKeyRepository.update(
        id,
        domainId,
        updateData,
        adminId,
      );
      return apiKey
        ? (normalizeApiKeyRecord(
            apiKey,
            language,
          ) as LocalizedApiKeyPublicRecord)
        : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  delete: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<ApiKeyPublicRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    try {
      const existingApiKey = await apiKeyRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingApiKey) {
        throw new Error('not found');
      }

      return await apiKeyRepository.softDelete(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
