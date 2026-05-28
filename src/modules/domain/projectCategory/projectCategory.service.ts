import {
  projectCategoryRepository,
  type ProjectCategoryRecord,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { isNonEmptyString, isPlainObject } from '@/utils/validation';

export interface CreateProjectCategoryInput {
  name: Record<string, unknown>;
  description?: string | null;
  parentCategoryId?: string | null;
  domainId: string;
  status: StatusEnum;
}

export interface UpdateProjectCategoryInput {
  name?: Record<string, unknown>;
  description?: string | null;
  parentCategoryId?: string | null;
  status?: StatusEnum;
}

type LocalizedText = string | Record<string, unknown>;

type LocalizedProjectCategoryRecord = Omit<ProjectCategoryRecord, 'name'> & {
  name: LocalizedText;
};

function buildProjectCategoryCode(name: Record<string, unknown>): string {
  return name.en?.toString().toUpperCase().replace(/\s+/g, '_') || '';
}

function buildProjectCategorySearchText(name: Record<string, unknown>): string {
  return Object.values(name).join(' ').toLowerCase();
}

function getLocalizedText(
  value: Record<string, unknown> | null,
  language: string | null,
): LocalizedText | null {
  if (!value) {
    return null;
  }

  if (!language) {
    return value;
  }

  const localizedValue = value[language] ?? value.en ?? '';

  return typeof localizedValue === 'string'
    ? localizedValue
    : String(localizedValue);
}

function normalizeProjectCategory(
  category: ProjectCategoryRecord,
  language: string | null,
): LocalizedProjectCategoryRecord {
  return {
    ...category,
    name: getLocalizedText(category.name, language) || '',
  };
}

function assertSingleLineDescription(
  value: string | null | undefined,
  field: string,
): void {
  if (value === undefined || value === null) {
    return;
  }

  if (!isNonEmptyString(value)) {
    throw new Error(`${field} is required`);
  }

  if (/[\r\n]/.test(value)) {
    throw new Error(`${field} must be single-line`);
  }
}

function assertCreateInput(data: CreateProjectCategoryInput): void {
  if (!isPlainObject(data.name)) {
    throw new Error('invalid json name');
  }

  if (!isNonEmptyString(data.name.en)) {
    throw new Error('name.en is required');
  }

  assertSingleLineDescription(data.description, 'description');

  if (!isNonEmptyString(data.domainId)) {
    throw new Error('invalid domainId');
  }

  if (
    data.parentCategoryId !== undefined &&
    data.parentCategoryId !== null &&
    !isNonEmptyString(data.parentCategoryId)
  ) {
    throw new Error('invalid parentCategoryId');
  }

  if (
    data.status !== StatusEnum.ACTIVE &&
    data.status !== StatusEnum.INACTIVE
  ) {
    throw new Error('invalid status');
  }
}

function assertUpdateInput(data: UpdateProjectCategoryInput): void {
  const hasName = data.name !== undefined;
  const hasDescription = data.description !== undefined;
  const hasParentCategoryId = data.parentCategoryId !== undefined;
  const hasStatus = data.status !== undefined;

  if (!hasName && !hasDescription && !hasParentCategoryId && !hasStatus) {
    throw new Error('empty update payload');
  }

  if (hasName && !isPlainObject(data.name)) {
    throw new Error('invalid json name');
  }

  if (hasName && !isNonEmptyString(data.name?.en)) {
    throw new Error('name.en is required');
  }

  if (hasDescription) {
    assertSingleLineDescription(data.description, 'description');
  }

  if (
    hasParentCategoryId &&
    data.parentCategoryId !== null &&
    !isNonEmptyString(data.parentCategoryId)
  ) {
    throw new Error('invalid parentCategoryId');
  }

  if (
    hasStatus &&
    data.status !== StatusEnum.ACTIVE &&
    data.status !== StatusEnum.INACTIVE
  ) {
    throw new Error('invalid status');
  }
}

export const projectCategoryService = {
  create: async (
    data: CreateProjectCategoryInput,
    language: string | null = null,
  ): Promise<LocalizedProjectCategoryRecord> => {
    assertCreateInput(data);

    try {
      const code = buildProjectCategoryCode(data.name);

      if (await projectCategoryRepository.findByCode(code, data.domainId)) {
        throw new Error('duplicate code');
      }

      if (data.parentCategoryId) {
        const parentCategory = await projectCategoryRepository.findById(
          data.parentCategoryId,
          data.domainId,
        );

        if (!parentCategory) {
          throw new Error('not found');
        }
      }

      const projectCategory = await projectCategoryRepository.create({
        ...data,
        code,
        searchText: buildProjectCategorySearchText(data.name),
      });

      return normalizeProjectCategory(projectCategory, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    searchKey?: string,
    language: string | null = null,
  ): Promise<LocalizedProjectCategoryRecord[]> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    try {
      const projectCategories = await projectCategoryRepository.findMany(
        domainId,
        searchKey,
      );
      return projectCategories.map((category) =>
        normalizeProjectCategory(category, language),
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
    language: string | null = null,
  ): Promise<LocalizedProjectCategoryRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const projectCategory = await projectCategoryRepository.findById(
        id,
        domainId,
      );
      return projectCategory
        ? normalizeProjectCategory(projectCategory, language)
        : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectCategoryInput,
    language: string | null = null,
  ): Promise<LocalizedProjectCategoryRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingCategory = await projectCategoryRepository.findById(
        id,
        domainId,
      );

      if (!existingCategory) {
        throw new Error('not found');
      }

      if (data.parentCategoryId) {
        const parentCategory = await projectCategoryRepository.findById(
          data.parentCategoryId,
          domainId,
        );

        if (!parentCategory) {
          throw new Error('not found');
        }
      }

      const updateData = {
        ...data,
        ...(data.name !== undefined && {
          code: buildProjectCategoryCode(data.name),
          searchText: buildProjectCategorySearchText(data.name),
        }),
      };

      if (updateData.code && updateData.code !== existingCategory.code) {
        const duplicateCategory = await projectCategoryRepository.findByCode(
          updateData.code,
          domainId,
        );

        if (duplicateCategory && duplicateCategory.id !== id) {
          throw new Error('duplicate code');
        }
      }

      const projectCategory = await projectCategoryRepository.update(
        id,
        domainId,
        updateData,
      );
      return projectCategory
        ? normalizeProjectCategory(projectCategory, language)
        : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<ProjectCategoryRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const existingCategory = await projectCategoryRepository.findById(
        id,
        domainId,
      );

      if (!existingCategory) {
        throw new Error('not found');
      }

      return await projectCategoryRepository.softDelete(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
