import {
  projectRepository,
  projectUserAssignmentRepository,
  projectUserDailyLogRepository,
  type CreateProjectUserAssignmentInput as RepositoryCreateProjectUserAssignmentInput,
  type ProjectUserAssignmentRecord,
  type UpdateProjectUserAssignmentInput as RepositoryUpdateProjectUserAssignmentInput,
} from '@repositories/index';
import { AttendanceStatusEnum, StatusEnum } from '@constants/index';
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

type ProjectUserAssignmentAvailability = {
  fromDate: string;
  toDate: string;
  users: {
    userId: string;
    user: Record<string, unknown> | null | undefined;
    assignedDates: string[];
    assignments: {
      id: string;
      projectId: string;
      project: Record<string, unknown> | null | undefined;
      startDate: Date;
      endDate: Date;
      assignedDates: string[];
      dailyWorkingHours: number;
      dayCharge: number;
      notes: string | null;
      status: StatusEnum;
    }[];
  }[];
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

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getMonthWindow(selectedDate: Date): { fromDate: Date; toDate: Date } {
  const fromDate = new Date(
    Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), 1),
  );
  const toDate = new Date(
    Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth() + 3, 0),
  );

  return { fromDate, toDate };
}

function getDateRangeDates(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const currentDate = new Date(
    Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate(),
    ),
  );
  const lastDate = new Date(
    Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate(),
    ),
  );

  while (currentDate.getTime() <= lastDate.getTime()) {
    dates.push(formatDateOnly(currentDate));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return dates;
}

function getClippedAssignedDates(
  assignment: ProjectUserAssignmentRecord,
  fromDate: Date,
  toDate: Date,
): string[] {
  const startDate =
    assignment.startDate.getTime() > fromDate.getTime()
      ? assignment.startDate
      : fromDate;
  const endDate =
    assignment.endDate.getTime() < toDate.getTime()
      ? assignment.endDate
      : toDate;

  return getDateRangeDates(startDate, endDate);
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

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

async function createMissingDailyLogsFromAssignments(
  assignments: ProjectUserAssignmentRecord[],
  domainId: string,
  adminId: string,
): Promise<void> {
  const activeAssignments = assignments.filter(
    (assignment) => assignment.status === StatusEnum.ACTIVE,
  );

  if (!activeAssignments.length) return;

  const logs = activeAssignments.flatMap((assignment) => {
    const startDate = startOfUtcDay(assignment.startDate);
    const endDate = startOfUtcDay(assignment.endDate);
    const rows = [];

    for (
      let currentDate = startDate;
      currentDate.getTime() <= endDate.getTime();
      currentDate = addDays(currentDate, 1)
    ) {
      const date = new Date(currentDate);
      rows.push({
        date,
        projectId: assignment.projectId,
        userId: assignment.userId,
        startTime: null,
        endTime: null,
        totalWorkingHours: assignment.dailyWorkingHours,
        dayCharge: assignment.dayCharge,
        attendanceStatus: AttendanceStatusEnum.PRESENT,
        notes: assignment.notes,
        domainId,
        adminId,
        status: StatusEnum.ACTIVE,
      });
    }

    return rows;
  });

  const duplicateLogs = await projectUserDailyLogRepository.findDuplicateLogs(
    logs,
    domainId,
    adminId,
  );
  const duplicateKeys = new Set(
    duplicateLogs.map((log) =>
      [log.projectId, log.userId, startOfUtcDay(log.date).toISOString()].join(
        ':',
      ),
    ),
  );
  const newLogs = logs.filter(
    (log) =>
      !duplicateKeys.has(
        [log.projectId, log.userId, startOfUtcDay(log.date).toISOString()].join(
          ':',
        ),
      ),
  );

  await projectUserDailyLogRepository.createMany(newLogs);
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
      await createMissingDailyLogsFromAssignments(
        createdAssignments,
        data.domainId,
        data.adminId,
      );

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

  getAvailability: async (
    domainId: string,
    adminId: string,
    filters: {
      date: string;
      projectId?: string;
      userId?: string;
    },
    language: string | null = null,
  ): Promise<ProjectUserAssignmentAvailability> => {
    if (!isNonEmptyString(domainId) || !isNonEmptyString(adminId)) {
      throw new Error('invalid auth ids');
    }

    try {
      const selectedDate = parseDate(filters.date, 'date');
      const { fromDate, toDate } = getMonthWindow(selectedDate);
      const assignments = await projectUserAssignmentRepository.findMany(
        domainId,
        adminId,
        {
          projectId: filters.projectId,
          userId: filters.userId,
          startDate: fromDate,
          endDate: toDate,
        },
      );
      const usersById = new Map<
        string,
        ProjectUserAssignmentAvailability['users'][number]
      >();

      for (const assignment of assignments) {
        const assignedDates = getClippedAssignedDates(
          assignment,
          fromDate,
          toDate,
        );
        const userEntry =
          usersById.get(assignment.userId) ??
          ({
            userId: assignment.userId,
            user: normalizeRelation(assignment.user, language),
            assignedDates: [],
            assignments: [],
          } satisfies ProjectUserAssignmentAvailability['users'][number]);

        userEntry.assignedDates = [
          ...new Set([...userEntry.assignedDates, ...assignedDates]),
        ].sort();
        userEntry.assignments.push({
          id: assignment.id,
          projectId: assignment.projectId,
          project: normalizeRelation(assignment.project, language),
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          assignedDates,
          dailyWorkingHours: assignment.dailyWorkingHours,
          dayCharge: assignment.dayCharge,
          notes: assignment.notes,
          status: assignment.status,
        });
        usersById.set(assignment.userId, userEntry);
      }

      return {
        fromDate: formatDateOnly(fromDate),
        toDate: formatDateOnly(toDate),
        users: [...usersById.values()],
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

      if (assignment) {
        await createMissingDailyLogsFromAssignments(
          [assignment],
          domainId,
          adminId,
        );
      }

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
