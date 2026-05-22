import {
  projectRepository,
  projectStageRepository,
  type ProjectStageRecord,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import {
  isNonEmptyString,
  isNonNegativeFiniteNumber,
  isPlainObject,
} from '@/utils/validation';

export interface CreateProjectStageInput {
  name: Record<string, unknown>;
  description?: string | null;
  progress?: number | null;
  expectedStartDate?: string;
  expectedEndDate?: string;
  projectId?: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateProjectStageInput {
  name?: Record<string, unknown>;
  description?: string | null;
  progress?: number | null;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  status?: StatusEnum;
}

type LocalizedProjectStageRecord = Omit<
  ProjectStageRecord,
  'name' | 'project' | 'domain' | 'admin'
> & {
  name: string;
};

type PaginatedProjectStages = {
  projectStages: LocalizedProjectStageRecord[];
  pagination: {
    totalCount: number;
    offset: number;
    limit: number;
  };
};

function buildProjectStageCode(name: Record<string, unknown>): string {
  return name.en?.toString().toUpperCase().replace(/\s+/g, '_') || '';
}

function buildProjectStageSearchText(name: Record<string, unknown>): string {
  return Object.values(name).join(' ').toLowerCase();
}

function getLocalizedText(
  value: Record<string, unknown> | null,
  language: string | null,
): string | null {
  if (!value) {
    return null;
  }

  const langCode = language || 'en';
  const localizedValue = value[langCode] ?? value.en ?? '';

  return typeof localizedValue === 'string'
    ? localizedValue
    : String(localizedValue);
}

function parseOptionalDate(
  value: string | Date | null | undefined,
  field: string,
): Date | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error(`invalid ${field}`);
    }

    return value;
  }

  if (!isNonEmptyString(value)) {
    throw new Error(`invalid ${field}`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`invalid ${field}`);
  }

  return date;
}

function ensureDateRange(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  startField: string,
  endField: string,
): void {
  if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
    throw new Error(`${endField} cannot be before ${startField}`);
  }
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

function normalizeProjectStage(
  stage: ProjectStageRecord,
  language: string | null,
): LocalizedProjectStageRecord {
  const stageData = { ...stage };
  delete stageData.project;
  delete stageData.domain;
  delete stageData.admin;

  return {
    ...stageData,
    name: getLocalizedText(stage.name, language) || '',
  };
}

function assertCreateInput(data: CreateProjectStageInput): void {
  if (!isPlainObject(data.name) || Object.keys(data.name).length === 0) {
    throw new Error('invalid json name');
  }

  if (!isNonEmptyString(data.name.en)) {
    throw new Error('name.en is required');
  }

  assertSingleLineDescription(data.description, 'description');

  if (
    data.progress !== undefined &&
    data.progress !== null &&
    !isNonNegativeFiniteNumber(data.progress)
  ) {
    throw new Error('invalid progress');
  }

  if (!isNonEmptyString(data.domainId)) {
    throw new Error('invalid domainId');
  }

  ensureDateRange(
    parseOptionalDate(data.expectedStartDate, 'expectedStartDate'),
    parseOptionalDate(data.expectedEndDate, 'expectedEndDate'),
    'expectedStartDate',
    'expectedEndDate',
  );

  if (
    data.status !== StatusEnum.ACTIVE &&
    data.status !== StatusEnum.INACTIVE
  ) {
    throw new Error('invalid status');
  }
}

async function validateProjectId(
  projectId: string | undefined,
  domainId: string,
  adminId: string,
): Promise<string | undefined> {
  if (isNonEmptyString(projectId)) {
    const project = await projectRepository.findById(
      projectId,
      domainId,
      adminId,
    );

    if (!project) {
      throw new Error('not found');
    }

    return project.id;
  }

  return undefined;
}

function assertUpdateInput(data: UpdateProjectStageInput): void {
  const hasName = data.name !== undefined;
  const hasDescription = data.description !== undefined;
  const hasStatus = data.status !== undefined;
  const hasActualStartDate = data.actualStartDate !== undefined;
  const hasActualEndDate = data.actualEndDate !== undefined;

  if (
    !hasName &&
    !hasDescription &&
    !hasStatus &&
    !hasActualStartDate &&
    !hasActualEndDate
  ) {
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
    hasStatus &&
    data.status !== StatusEnum.ACTIVE &&
    data.status !== StatusEnum.INACTIVE
  ) {
    throw new Error('invalid status');
  }

  ensureDateRange(
    parseOptionalDate(data.actualStartDate, 'actualStartDate'),
    parseOptionalDate(data.actualEndDate, 'actualEndDate'),
    'actualStartDate',
    'actualEndDate',
  );
}

export const projectStageService = {
  create: async (
    data: CreateProjectStageInput,
    language: string | null = null,
  ): Promise<LocalizedProjectStageRecord> => {
    assertCreateInput(data);

    try {
      const projectId = await validateProjectId(
        data.projectId,
        data.domainId,
        data.adminId,
      );

      const code = buildProjectStageCode(data.name);

      if (
        await projectStageRepository.findByCode(
          code,
          data.domainId,
          projectId,
          data.adminId,
        )
      ) {
        throw new Error('duplicate code');
      }

      const stage = await projectStageRepository.create({
        ...data,
        projectId,
        progress: 0,
        code,
        searchText: buildProjectStageSearchText(data.name),
        expectedStartDate: parseOptionalDate(
          data.expectedStartDate,
          'expectedStartDate',
        ),
        expectedEndDate: parseOptionalDate(
          data.expectedEndDate,
          'expectedEndDate',
        ),
      });

      return normalizeProjectStage(stage, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    adminId: string,
    projectId: string,
    searchKey?: string,
    paginationQuery: PaginationQuery = {},
    language: string | null = null,
  ): Promise<PaginatedProjectStages> => {
    if (!isNonEmptyString(domainId) || !isNonEmptyString(projectId)) {
      throw new Error('invalid ids');
    }

    try {
      const { offset, limit } = normalizePagination(paginationQuery);
      const stages = await projectStageRepository.findMany(
        domainId,
        projectId,
        adminId,
        searchKey,
      );
      const paginatedStages = stages.slice(offset, offset + limit);

      return {
        projectStages: paginatedStages.map((stage) =>
          normalizeProjectStage(stage, language),
        ),
        pagination: {
          totalCount: stages.length,
          offset,
          limit,
        },
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
  ): Promise<LocalizedProjectStageRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const stage = await projectStageRepository.findById(
        id,
        domainId,
        adminId,
      );
      return stage ? normalizeProjectStage(stage, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateProjectStageInput,
    language: string | null = null,
  ): Promise<LocalizedProjectStageRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingStage = await projectStageRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingStage) {
        throw new Error('not found');
      }

      const { actualStartDate, actualEndDate, ...stageData } = data;
      delete stageData.progress;
      const updateData = {
        ...stageData,
        ...(actualStartDate !== undefined && {
          actualStartDate: parseOptionalDate(
            actualStartDate,
            'actualStartDate',
          ),
        }),
        ...(actualEndDate !== undefined && {
          actualEndDate: parseOptionalDate(actualEndDate, 'actualEndDate'),
        }),
        ...(data.name !== undefined
          ? {
              ...(data.name !== undefined && {
                code: buildProjectStageCode(data.name),
              }),
              searchText: buildProjectStageSearchText(data.name),
            }
          : {}),
      };

      if (updateData.code && updateData.code !== existingStage.code) {
        const duplicateStage = await projectStageRepository.findByCode(
          updateData.code,
          domainId,
          existingStage.projectId,
          adminId,
        );

        if (duplicateStage && duplicateStage.id !== id) {
          throw new Error('duplicate code');
        }
      }

      const stage = await projectStageRepository.update(
        id,
        domainId,
        updateData,
        adminId,
      );
      return stage ? normalizeProjectStage(stage, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<ProjectStageRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const existingStage = await projectStageRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingStage) {
        throw new Error('not found');
      }

      return await projectStageRepository.softDelete(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
