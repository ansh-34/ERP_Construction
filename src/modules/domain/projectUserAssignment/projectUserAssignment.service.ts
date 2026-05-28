import {
  projectRepository,
  projectUserAssignmentRepository,
  type CreateProjectUserAssignmentInput as RepositoryCreateProjectUserAssignmentInput,
  type ProjectUserAssignmentRecord,
  type UpdateProjectUserAssignmentInput as RepositoryUpdateProjectUserAssignmentInput,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import {
  isNonEmptyString,
  isNonNegativeFiniteNumber,
  isPositiveFiniteNumber,
} from '@/utils/validation';

type AssignmentInput = {
  projectId: string;
  userId: string;
  startDate: string;
  endDate: string;
  dailyWorkingHours: number;
  dayCharge: number;
  notes?: string | null;
  status?: StatusEnum;
};

export interface CreateProjectUserAssignmentInput {
  assignments: AssignmentInput[];
  domainId: string;
  adminId: string;
}

export interface UpdateProjectUserAssignmentInput {
  startDate?: string;
  endDate?: string;
  dailyWorkingHours?: number;
  dayCharge?: number;
  notes?: string | null;
  status?: StatusEnum;
}

type PaginatedProjectUserAssignments = {
  projectUserAssignments: ProjectUserAssignmentRecord[];
  pagination: {
    totalCount: number;
    offset: number;
    limit: number;
  };
};

function parseDate(value: string, field: string): Date {
  if (!isNonEmptyString(value)) {
    throw new Error(`invalid ${field}`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`invalid ${field}`);
  }

  return date;
}

function parseOptionalDate(
  value: string | undefined,
  field: string,
): Date | undefined {
  return value === undefined ? undefined : parseDate(value, field);
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

function getLocalizedText(
  value: unknown,
  language: string | null,
): string | Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return typeof value === 'string' ? value : '';
  }

  const record = value as Record<string, unknown>;
  if (!language) {
    return record;
  }

  const localizedValue = record[language] ?? record.en ?? '';

  return typeof localizedValue === 'string'
    ? localizedValue
    : String(localizedValue);
}

function normalizeRelation(
  relation: Record<string, unknown> | null | undefined,
  language: string | null,
): Record<string, unknown> | null | undefined {
  if (!relation) {
    return relation;
  }

  const name = relation.name;

  return {
    ...relation,
    name:
      name && typeof name === 'object'
        ? getLocalizedText(name, language)
        : name,
  };
}

function normalizeProjectUserAssignment(
  assignment: ProjectUserAssignmentRecord,
  language: string | null,
): ProjectUserAssignmentRecord {
  return {
    ...assignment,
    project: normalizeRelation(assignment.project, language),
    domain: normalizeRelation(assignment.domain, language),
    admin: normalizeRelation(assignment.admin, language),
  };
}

function buildAssignmentInputs(
  data: CreateProjectUserAssignmentInput,
): AssignmentInput[] {
  if (data.assignments.length) {
    return data.assignments;
  }

  throw new Error('invalid assignment payload');
}

function validateAssignmentRow(row: AssignmentInput): void {
  if (!isNonEmptyString(row.projectId)) {
    throw new Error('invalid projectId');
  }

  if (!isNonEmptyString(row.userId)) {
    throw new Error('invalid userId');
  }

  if (!isPositiveFiniteNumber(row.dailyWorkingHours)) {
    throw new Error('invalid dailyWorkingHours');
  }

  if (!isNonNegativeFiniteNumber(row.dayCharge)) {
    throw new Error('invalid dayCharge');
  }

  assertStatus(row.status);
}

function ensureDateRange(startDate: Date, endDate: Date): void {
  if (endDate.getTime() < startDate.getTime()) {
    throw new Error('endDate cannot be before startDate');
  }
}

function assertNoDuplicateRows(
  assignments: RepositoryCreateProjectUserAssignmentInput[],
): void {
  const keys = new Set<string>();

  for (const assignment of assignments) {
    const key = [
      assignment.projectId,
      assignment.userId,
      assignment.startDate.toISOString(),
      assignment.endDate.toISOString(),
    ].join(':');

    if (keys.has(key)) {
      throw new Error('duplicate assignment in request');
    }

    keys.add(key);
  }
}

async function assertProjectsExist(
  projectIds: string[],
  domainId: string,
  adminId: string,
): Promise<void> {
  for (const projectId of projectIds) {
    const project = await projectRepository.findById(
      projectId,
      domainId,
      adminId,
    );

    if (!project) {
      throw new Error('project not found');
    }
  }
}

async function assertUsersExist(
  userIds: string[],
  domainId: string,
): Promise<void> {
  const missingUserIds =
    await projectUserAssignmentRepository.findMissingUserIds(
      [...new Set(userIds)],
      domainId,
    );

  if (missingUserIds.length) {
    throw new Error(`user not found: ${missingUserIds.join(', ')}`);
  }
}

export const projectUserAssignmentService = {
  create: async (
    data: CreateProjectUserAssignmentInput,
    language: string | null = null,
  ): Promise<ProjectUserAssignmentRecord[]> => {
    if (!isNonEmptyString(data.domainId) || !isNonEmptyString(data.adminId)) {
      throw new Error('invalid auth ids');
    }

    try {
      const assignmentInputs = buildAssignmentInputs(data);
      const assignments = assignmentInputs.map((row) => {
        validateAssignmentRow(row);

        const startDate = parseDate(row.startDate, 'startDate');
        const endDate = parseDate(row.endDate, 'endDate');
        ensureDateRange(startDate, endDate);

        return {
          startDate,
          endDate,
          projectId: row.projectId,
          userId: row.userId,
          dailyWorkingHours: row.dailyWorkingHours,
          dayCharge: row.dayCharge,
          notes: row.notes ?? null,
          domainId: data.domainId,
          adminId: data.adminId,
          status: row.status ?? StatusEnum.ACTIVE,
        };
      });

      assertNoDuplicateRows(assignments);

      await assertProjectsExist(
        [...new Set(assignments.map((assignment) => assignment.projectId))],
        data.domainId,
        data.adminId,
      );
      await assertUsersExist(
        assignments.map((assignment) => assignment.userId),
        data.domainId,
      );

      const overlapping =
        await projectUserAssignmentRepository.findOverlappingAssignments(
          assignments,
          data.domainId,
          data.adminId,
        );

      if (overlapping.length) {
        throw new Error('assignment already exists for this date range');
      }

      const createdAssignments =
        await projectUserAssignmentRepository.createMany(assignments);

      return createdAssignments.map((assignment) =>
        normalizeProjectUserAssignment(assignment, language),
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    adminId: string,
    filters: {
      projectId?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
      currentDate?: string;
      searchKey?: string;
    },
    paginationQuery: PaginationQuery = {},
    language: string | null = null,
  ): Promise<PaginatedProjectUserAssignments> => {
    if (!isNonEmptyString(domainId) || !isNonEmptyString(adminId)) {
      throw new Error('invalid auth ids');
    }

    try {
      const { offset, limit } = normalizePagination(paginationQuery);
      const assignments = await projectUserAssignmentRepository.findMany(
        domainId,
        adminId,
        {
          projectId: filters.projectId,
          userId: filters.userId,
          startDate: parseOptionalDate(filters.startDate, 'startDate'),
          endDate: parseOptionalDate(filters.endDate, 'endDate'),
          currentDate: parseOptionalDate(filters.currentDate, 'currentDate'),
          searchKey: filters.searchKey,
        },
      );
      const paginatedAssignments = assignments.slice(offset, offset + limit);

      return {
        projectUserAssignments: paginatedAssignments.map((assignment) =>
          normalizeProjectUserAssignment(assignment, language),
        ),
        pagination: {
          totalCount: assignments.length,
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
  ): Promise<ProjectUserAssignmentRecord | null> => {
    if (
      !isNonEmptyString(id) ||
      !isNonEmptyString(domainId) ||
      !isNonEmptyString(adminId)
    ) {
      throw new Error('invalid ids');
    }

    try {
      const assignment = await projectUserAssignmentRepository.findById(
        id,
        domainId,
        adminId,
      );

      return assignment
        ? normalizeProjectUserAssignment(assignment, language)
        : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateProjectUserAssignmentInput,
    language: string | null = null,
  ): Promise<ProjectUserAssignmentRecord | null> => {
    if (
      !isNonEmptyString(id) ||
      !isNonEmptyString(domainId) ||
      !isNonEmptyString(adminId)
    ) {
      throw new Error('invalid ids');
    }

    assertStatus(data.status);

    if (
      data.dailyWorkingHours !== undefined &&
      !isPositiveFiniteNumber(data.dailyWorkingHours)
    ) {
      throw new Error('invalid dailyWorkingHours');
    }

    if (
      data.dayCharge !== undefined &&
      !isNonNegativeFiniteNumber(data.dayCharge)
    ) {
      throw new Error('invalid dayCharge');
    }

    try {
      const existingAssignment = await projectUserAssignmentRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingAssignment) {
        throw new Error('not found');
      }

      const startDate =
        parseOptionalDate(data.startDate, 'startDate') ??
        existingAssignment.startDate;
      const endDate =
        parseOptionalDate(data.endDate, 'endDate') ??
        existingAssignment.endDate;
      ensureDateRange(startDate, endDate);

      const overlapping =
        await projectUserAssignmentRepository.findOverlappingAssignments(
          [
            {
              projectId: existingAssignment.projectId,
              userId: existingAssignment.userId,
              startDate,
              endDate,
            },
          ],
          domainId,
          adminId,
          id,
        );

      if (overlapping.length) {
        throw new Error('assignment already exists for this date range');
      }

      const updateData: RepositoryUpdateProjectUserAssignmentInput = {
        ...(data.startDate !== undefined && { startDate }),
        ...(data.endDate !== undefined && { endDate }),
        ...(data.dailyWorkingHours !== undefined && {
          dailyWorkingHours: data.dailyWorkingHours,
        }),
        ...(data.dayCharge !== undefined && { dayCharge: data.dayCharge }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status !== undefined && { status: data.status }),
      };

      const assignment = await projectUserAssignmentRepository.update(
        id,
        domainId,
        adminId,
        updateData,
      );

      return assignment
        ? normalizeProjectUserAssignment(assignment, language)
        : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<ProjectUserAssignmentRecord | null> => {
    if (
      !isNonEmptyString(id) ||
      !isNonEmptyString(domainId) ||
      !isNonEmptyString(adminId)
    ) {
      throw new Error('invalid ids');
    }

    try {
      const existingAssignment = await projectUserAssignmentRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingAssignment) {
        throw new Error('not found');
      }

      return await projectUserAssignmentRepository.softDelete(
        id,
        domainId,
        adminId,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
