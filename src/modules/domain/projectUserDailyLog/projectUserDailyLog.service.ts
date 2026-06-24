import {
  projectRepository,
  projectUserAssignmentRepository,
  projectUserDailyLogRepository,
  type CreateProjectUserDailyLogInput as RepositoryCreateProjectUserDailyLogInput,
  type ProjectUserDailyLogRecord,
  type UpdateProjectUserDailyLogInput as RepositoryUpdateProjectUserDailyLogInput,
} from '@repositories/index';
import { AttendanceStatusEnum, StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import {
  isNonEmptyString,
  isNonNegativeFiniteNumber,
} from '@/utils/validation';

type DailyLogInput = {
  date: string;
  projectId: string;
  userId: string;
  startTime?: string | null;
  endTime?: string | null;
  totalWorkingHours?: number;
  dayCharge: number;
  attendanceStatus?: AttendanceStatusEnum;
  notes?: string | null;
  status?: StatusEnum;
};

export interface CreateProjectUserDailyLogInput {
  logs: DailyLogInput[];
  domainId: string;
  adminId: string;
}

export interface UpdateProjectUserDailyLogInput {
  date?: string;
  startTime?: string | null;
  endTime?: string | null;
  totalWorkingHours?: number;
  dayCharge?: number;
  attendanceStatus?: AttendanceStatusEnum;
  notes?: string | null;
  status?: StatusEnum;
}

type PaginatedProjectUserDailyLogs = {
  projectUserDailyLogs: ProjectUserDailyLogRecord[];
  pagination: {
    totalCount: number;
    offset: number;
    limit: number;
  };
};

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

function normalizeProjectUserDailyLog(
  log: ProjectUserDailyLogRecord,
  language: string | null,
): ProjectUserDailyLogRecord {
  return {
    ...log,
    project: normalizeRelation(log.project, language),
    domain: normalizeRelation(log.domain, language),
    admin: normalizeRelation(log.admin, language),
  };
}

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

function parseTime(value: string, date: Date, field: string): Date {
  if (!isNonEmptyString(value)) {
    throw new Error(`invalid ${field}`);
  }

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    const [hours, minutes, seconds = '0'] = value.split(':');
    const time = new Date(date);
    time.setUTCHours(Number(hours), Number(minutes), Number(seconds), 0);
    return time;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`invalid ${field}`);
  }

  return parsed;
}

function parseNullableTime(
  value: string | null | undefined,
  date: Date,
  field: string,
): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return parseTime(value, date, field);
}

function parseOptionalDate(
  value: string | undefined,
  field: string,
): Date | undefined {
  return value === undefined ? undefined : parseDate(value, field);
}

function resolveListDateFilters(filters: {
  date?: string;
  startDate?: string;
  endDate?: string;
}): { date?: Date; startDate?: Date; endDate?: Date } {
  const date = parseOptionalDate(filters.date, 'date');
  const startDate = parseOptionalDate(filters.startDate, 'startDate');
  const endDate = parseOptionalDate(filters.endDate, 'endDate');

  if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
    throw new Error('endDate cannot be before startDate');
  }

  if (!date && !startDate && !endDate) {
    return { date: new Date() };
  }

  return { date, startDate, endDate };
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

function assertAttendanceStatus(
  attendanceStatus: AttendanceStatusEnum | undefined,
): void {
  if (
    attendanceStatus !== undefined &&
    attendanceStatus !== AttendanceStatusEnum.PRESENT &&
    attendanceStatus !== AttendanceStatusEnum.ABSENT &&
    attendanceStatus !== AttendanceStatusEnum.HALF_DAY &&
    attendanceStatus !== AttendanceStatusEnum.LEAVE
  ) {
    throw new Error('invalid attendanceStatus');
  }
}

function calculateWorkingHours(startTime: Date, endTime: Date): number {
  const diffMs = endTime.getTime() - startTime.getTime();

  if (diffMs <= 0) {
    throw new Error('endTime must be after startTime');
  }

  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
}

function calculateWorkingHoursIfTimed(
  startTime: Date | null,
  endTime: Date | null,
): number | null {
  if (!startTime || !endTime) return null;
  return calculateWorkingHours(startTime, endTime);
}

function validateWorkingHoursForAttendance(totalWorkingHours: number): void {
  if (!isNonNegativeFiniteNumber(totalWorkingHours)) {
    throw new Error('invalid totalWorkingHours');
  }
}

function validateLogRow(row: DailyLogInput): void {
  if (!isNonEmptyString(row.projectId)) {
    throw new Error('invalid projectId');
  }

  if (!isNonEmptyString(row.userId)) {
    throw new Error('invalid userId');
  }

  if (
    row.totalWorkingHours !== undefined &&
    !isNonNegativeFiniteNumber(row.totalWorkingHours)
  ) {
    throw new Error('invalid totalWorkingHours');
  }

  if (!isNonNegativeFiniteNumber(row.dayCharge)) {
    throw new Error('invalid dayCharge');
  }

  assertStatus(row.status);
  assertAttendanceStatus(row.attendanceStatus);
}

function assertNoDuplicateRows(
  logs: RepositoryCreateProjectUserDailyLogInput[],
): void {
  const keys = new Set<string>();

  for (const log of logs) {
    const key = [log.projectId, log.userId, log.date.toISOString()].join(':');

    if (keys.has(key)) {
      throw new Error('duplicate daily log in request');
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

function buildUpdateData(
  data: UpdateProjectUserDailyLogInput,
  existingLog: ProjectUserDailyLogRecord,
): RepositoryUpdateProjectUserDailyLogInput {
  const date = data.date ? parseDate(data.date, 'date') : existingLog.date;
  const parsedStartTime = parseNullableTime(data.startTime, date, 'startTime');
  const parsedEndTime = parseNullableTime(data.endTime, date, 'endTime');
  const startTime =
    parsedStartTime !== undefined ? parsedStartTime : existingLog.startTime;
  const endTime =
    parsedEndTime !== undefined ? parsedEndTime : existingLog.endTime;
  const attendanceStatus =
    data.attendanceStatus ??
    existingLog.attendanceStatus ??
    AttendanceStatusEnum.PRESENT;
  const isNonWorkingAttendance =
    attendanceStatus === AttendanceStatusEnum.ABSENT ||
    attendanceStatus === AttendanceStatusEnum.LEAVE;
  const hasTimeChange =
    data.startTime !== undefined || data.endTime !== undefined;
  const calculatedWorkingHours = calculateWorkingHoursIfTimed(
    startTime,
    endTime,
  );
  const totalWorkingHours =
    data.totalWorkingHours ??
    (isNonWorkingAttendance
      ? 0
      : hasTimeChange && calculatedWorkingHours !== null
        ? calculatedWorkingHours
        : existingLog.totalWorkingHours);
  const dayCharge =
    data.dayCharge ??
    (data.attendanceStatus !== undefined && isNonWorkingAttendance
      ? 0
      : existingLog.dayCharge);

  validateWorkingHoursForAttendance(totalWorkingHours);

  if (!isNonNegativeFiniteNumber(dayCharge)) {
    throw new Error('invalid dayCharge');
  }

  return {
    ...(data.date !== undefined && { date }),
    ...(data.startTime !== undefined && { startTime }),
    ...(data.endTime !== undefined && { endTime }),
    ...(data.startTime !== undefined ||
    data.endTime !== undefined ||
    data.totalWorkingHours !== undefined ||
    (data.attendanceStatus !== undefined && isNonWorkingAttendance)
      ? { totalWorkingHours }
      : {}),
    ...(data.dayCharge !== undefined ||
    (data.attendanceStatus !== undefined && isNonWorkingAttendance)
      ? { dayCharge }
      : {}),
    ...(data.attendanceStatus !== undefined && { attendanceStatus }),
    ...(data.notes !== undefined && { notes: data.notes }),
    ...(data.status !== undefined && { status: data.status }),
  };
}

export const projectUserDailyLogService = {
  create: async (
    data: CreateProjectUserDailyLogInput,
    language: string | null = null,
  ): Promise<ProjectUserDailyLogRecord[]> => {
    if (!isNonEmptyString(data.domainId) || !isNonEmptyString(data.adminId)) {
      throw new Error('invalid auth ids');
    }

    try {
      if (!data.logs.length) {
        throw new Error('invalid daily log payload');
      }

      const logs = data.logs.map((row) => {
        validateLogRow(row);

        const date = parseDate(row.date, 'date');
        const startTime =
          parseNullableTime(row.startTime, date, 'startTime') ?? null;
        const endTime = parseNullableTime(row.endTime, date, 'endTime') ?? null;
        const calculatedWorkingHours = calculateWorkingHoursIfTimed(
          startTime,
          endTime,
        );
        const totalWorkingHours =
          row.totalWorkingHours ?? calculatedWorkingHours ?? 0;
        const attendanceStatus =
          row.attendanceStatus ?? AttendanceStatusEnum.PRESENT;

        validateWorkingHoursForAttendance(totalWorkingHours);

        return {
          date,
          projectId: row.projectId,
          userId: row.userId,
          startTime,
          endTime,
          totalWorkingHours,
          dayCharge: row.dayCharge,
          attendanceStatus,
          notes: row.notes ?? null,
          domainId: data.domainId,
          adminId: data.adminId,
          status: row.status ?? StatusEnum.ACTIVE,
        };
      });

      assertNoDuplicateRows(logs);

      await assertProjectsExist(
        [...new Set(logs.map((log) => log.projectId))],
        data.domainId,
        data.adminId,
      );
      await assertUsersExist(
        logs.map((log) => log.userId),
        data.domainId,
      );

      const duplicateLogs =
        await projectUserDailyLogRepository.findDuplicateLogs(
          logs,
          data.domainId,
          data.adminId,
        );

      if (duplicateLogs.length) {
        throw new Error('daily log already exists for this date');
      }

      const createdLogs = await projectUserDailyLogRepository.createMany(logs);

      return createdLogs.map((log) =>
        normalizeProjectUserDailyLog(log, language),
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
      date?: string;
      startDate?: string;
      endDate?: string;
      searchKey?: string;
    },
    paginationQuery: PaginationQuery = {},
    language: string | null = null,
  ): Promise<PaginatedProjectUserDailyLogs> => {
    if (!isNonEmptyString(domainId) || !isNonEmptyString(adminId)) {
      throw new Error('invalid auth ids');
    }

    try {
      const { offset, limit } = normalizePagination(paginationQuery);
      const dateFilters = resolveListDateFilters(filters);
      const logs = await projectUserDailyLogRepository.findMany(
        domainId,
        adminId,
        {
          projectId: filters.projectId,
          userId: filters.userId,
          date: dateFilters.date,
          startDate: dateFilters.startDate,
          endDate: dateFilters.endDate,
          searchKey: filters.searchKey,
        },
      );
      const paginatedLogs = logs.slice(offset, offset + limit);

      return {
        projectUserDailyLogs: paginatedLogs.map((log) =>
          normalizeProjectUserDailyLog(log, language),
        ),
        pagination: {
          totalCount: logs.length,
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
  ): Promise<ProjectUserDailyLogRecord | null> => {
    if (
      !isNonEmptyString(id) ||
      !isNonEmptyString(domainId) ||
      !isNonEmptyString(adminId)
    ) {
      throw new Error('invalid ids');
    }

    try {
      const log = await projectUserDailyLogRepository.findById(
        id,
        domainId,
        adminId,
      );

      return log ? normalizeProjectUserDailyLog(log, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateProjectUserDailyLogInput,
    language: string | null = null,
  ): Promise<ProjectUserDailyLogRecord | null> => {
    if (
      !isNonEmptyString(id) ||
      !isNonEmptyString(domainId) ||
      !isNonEmptyString(adminId)
    ) {
      throw new Error('invalid ids');
    }

    assertStatus(data.status);
    assertAttendanceStatus(data.attendanceStatus);

    try {
      const existingLog = await projectUserDailyLogRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingLog) {
        throw new Error('not found');
      }

      const updateData = buildUpdateData(data, existingLog);
      const nextDate = updateData.date ?? existingLog.date;
      const duplicateLogs =
        await projectUserDailyLogRepository.findDuplicateLogs(
          [
            {
              projectId: existingLog.projectId,
              userId: existingLog.userId,
              date: nextDate,
            },
          ],
          domainId,
          adminId,
          id,
        );

      if (duplicateLogs.length) {
        throw new Error('daily log already exists for this date');
      }

      const log = await projectUserDailyLogRepository.update(
        id,
        domainId,
        adminId,
        updateData,
      );

      return log ? normalizeProjectUserDailyLog(log, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<ProjectUserDailyLogRecord | null> => {
    if (
      !isNonEmptyString(id) ||
      !isNonEmptyString(domainId) ||
      !isNonEmptyString(adminId)
    ) {
      throw new Error('invalid ids');
    }

    try {
      const existingLog = await projectUserDailyLogRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingLog) {
        throw new Error('not found');
      }

      return await projectUserDailyLogRepository.softDelete(
        id,
        domainId,
        adminId,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
