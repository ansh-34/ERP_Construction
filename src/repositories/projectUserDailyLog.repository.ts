import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type RelationDetails = Record<string, unknown> | null;

export interface ProjectUserDailyLogRecord {
  id: string;
  date: Date;
  projectId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  totalWorkingHours: number;
  dayCharge: number;
  notes: string | null;
  domainId: string;
  adminId: string;
  project?: RelationDetails;
  user?: RelationDetails;
  domain?: RelationDetails;
  admin?: RelationDetails;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectUserDailyLogInput {
  date: Date;
  projectId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  totalWorkingHours: number;
  dayCharge: number;
  notes?: string | null;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateProjectUserDailyLogInput {
  date?: Date;
  startTime?: Date;
  endTime?: Date;
  totalWorkingHours?: number;
  dayCharge?: number;
  notes?: string | null;
  status?: StatusEnum;
}

const projectUserDailyLogSelect = Prisma.sql`
  "id",
  "date",
  "projectId",
  "userId",
  "startTime",
  "endTime",
  "totalWorkingHours",
  "dayCharge",
  "notes",
  "domainId",
  "adminId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

const projectUserDailyLogListSelect = Prisma.sql`
  pudl."id",
  pudl."date",
  jsonb_build_object(
    'projectId', p."id",
    'name', p."name",
    'code', p."code"
  ) AS "project",
  jsonb_build_object(
    'userId', u."id",
    'name', u."name",
    'email', u."email",
    'phoneCode', u."phoneCode",
    'phone', u."phone",
    'roleId', u."roleId"
  ) AS "user",
  pudl."startTime",
  pudl."endTime",
  pudl."totalWorkingHours",
  pudl."dayCharge",
  pudl."notes",
  jsonb_build_object(
    'domainId', d."id",
    'name', d."name",
    'email', d."email"
  ) AS "domain",
  jsonb_build_object(
    'adminId', a."id",
    'name', a."name",
    'email', a."email"
  ) AS "admin",
  pudl."status",
  pudl."isDeleted",
  pudl."createdAt",
  pudl."updatedAt"
`;

const projectUserDailyLogDetailSelect = Prisma.sql`
  pudl."id",
  pudl."date",
  pudl."projectId",
  pudl."userId",
  jsonb_build_object(
    'projectId', p."id",
    'name', p."name",
    'code', p."code",
    'description', p."description",
    'budget', p."budget",
    'spent', p."spent",
    'locationId', p."locationId",
    'status', p."status"
  ) AS "project",
  jsonb_build_object(
    'userId', u."id",
    'name', u."name",
    'email', u."email",
    'phoneCode', u."phoneCode",
    'phone', u."phone",
    'roleId', u."roleId",
    'industry', u."industry",
    'status', u."status"
  ) AS "user",
  pudl."startTime",
  pudl."endTime",
  pudl."totalWorkingHours",
  pudl."dayCharge",
  pudl."notes",
  pudl."domainId",
  pudl."adminId",
  jsonb_build_object(
    'domainId', d."id",
    'name', d."name",
    'email', d."email",
    'phoneCode', d."phoneCode",
    'phone', d."phone",
    'industry', d."industry",
    'status', d."status"
  ) AS "domain",
  jsonb_build_object(
    'adminId', a."id",
    'name', a."name",
    'email', a."email",
    'phoneCode', a."phoneCode",
    'phone', a."phone",
    'status', a."status"
  ) AS "admin",
  pudl."status",
  pudl."isDeleted",
  pudl."createdAt",
  pudl."updatedAt"
`;

export const projectUserDailyLogRepository = {
  createMany: async (
    data: CreateProjectUserDailyLogInput[],
  ): Promise<ProjectUserDailyLogRecord[]> => {
    if (!data.length) return [];

    const rows = data.map((item) => ({
      id: randomUUID(),
      ...item,
      notes: item.notes ?? null,
    }));

    return prisma
      .$transaction(
        rows.map((row) =>
          prisma.$queryRaw<ProjectUserDailyLogRecord[]>(Prisma.sql`
            INSERT INTO "ProjectUserDailyLog" (
              "id",
              "date",
              "projectId",
              "userId",
              "startTime",
              "endTime",
              "totalWorkingHours",
              "dayCharge",
              "notes",
              "domainId",
              "adminId",
              "status",
              "isDeleted",
              "createdAt",
              "updatedAt"
            )
            VALUES (
              ${row.id},
              ${row.date},
              ${row.projectId},
              ${row.userId},
              ${row.startTime},
              ${row.endTime},
              ${row.totalWorkingHours},
              ${row.dayCharge},
              ${row.notes},
              ${row.domainId},
              ${row.adminId},
              ${row.status},
              false,
              NOW(),
              NOW()
            )
            RETURNING ${projectUserDailyLogSelect}
          `),
        ),
      )
      .then((results) => results.flat());
  },

  findMany: async (
    domainId: string,
    adminId: string,
    filters: {
      projectId?: string;
      userId?: string;
      date?: Date;
      startDate?: Date;
      endDate?: Date;
      searchKey?: string;
    } = {},
  ): Promise<ProjectUserDailyLogRecord[]> => {
    const where = [
      Prisma.sql`pudl."domainId" = ${domainId}`,
      Prisma.sql`pudl."adminId" = ${adminId}`,
      Prisma.sql`pudl."isDeleted" = false`,
    ];

    if (filters.projectId) {
      where.push(Prisma.sql`pudl."projectId" = ${filters.projectId}`);
    }

    if (filters.userId) {
      where.push(Prisma.sql`pudl."userId" = ${filters.userId}`);
    }

    if (filters.date) {
      where.push(Prisma.sql`DATE(pudl."date") = DATE(${filters.date})`);
    }

    if (filters.startDate) {
      where.push(Prisma.sql`DATE(pudl."date") >= DATE(${filters.startDate})`);
    }

    if (filters.endDate) {
      where.push(Prisma.sql`DATE(pudl."date") <= DATE(${filters.endDate})`);
    }

    if (filters.searchKey) {
      const search = `%${filters.searchKey.toLowerCase()}%`;
      where.push(Prisma.sql`(
        LOWER(u."name") LIKE ${search}
        OR LOWER(u."email") LIKE ${search}
        OR LOWER(p."code") LIKE ${search}
        OR LOWER(pudl."notes") LIKE ${search}
      )`);
    }

    return prisma.$queryRaw<ProjectUserDailyLogRecord[]>(Prisma.sql`
      SELECT ${projectUserDailyLogListSelect}
      FROM "ProjectUserDailyLog" pudl
      INNER JOIN "Project" p ON p."id" = pudl."projectId"
      INNER JOIN "User" u ON u."id" = pudl."userId"
      INNER JOIN "Domain" d ON d."id" = pudl."domainId"
      INNER JOIN "Admin" a ON a."id" = pudl."adminId"
      WHERE ${Prisma.join(where, ' AND ')}
      ORDER BY pudl."date" DESC, pudl."createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<ProjectUserDailyLogRecord | null> => {
    const result = await prisma.$queryRaw<
      ProjectUserDailyLogRecord[]
    >(Prisma.sql`
      SELECT ${projectUserDailyLogDetailSelect}
      FROM "ProjectUserDailyLog" pudl
      INNER JOIN "Project" p ON p."id" = pudl."projectId"
      INNER JOIN "User" u ON u."id" = pudl."userId"
      INNER JOIN "Domain" d ON d."id" = pudl."domainId"
      INNER JOIN "Admin" a ON a."id" = pudl."adminId"
      WHERE pudl."id" = ${id}
        AND pudl."domainId" = ${domainId}
        AND pudl."adminId" = ${adminId}
        AND pudl."isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findDuplicateLogs: async (
    logs: { projectId: string; userId: string; date: Date }[],
    domainId: string,
    adminId: string,
    excludeId?: string,
  ): Promise<ProjectUserDailyLogRecord[]> => {
    if (!logs.length) return [];

    const filters = logs.map(
      (log) => Prisma.sql`(
        "projectId" = ${log.projectId}
        AND "userId" = ${log.userId}
        AND DATE("date") = DATE(${log.date})
      )`,
    );
    const baseFilters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"adminId" = ${adminId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (excludeId) {
      baseFilters.push(Prisma.sql`"id" <> ${excludeId}`);
    }

    return prisma.$queryRaw<ProjectUserDailyLogRecord[]>(Prisma.sql`
      SELECT ${projectUserDailyLogSelect}
      FROM "ProjectUserDailyLog"
      WHERE ${Prisma.join(baseFilters, ' AND ')}
        AND (${Prisma.join(filters, ' OR ')})
    `);
  },

  update: async (
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateProjectUserDailyLogInput,
  ): Promise<ProjectUserDailyLogRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.date !== undefined) {
      assignments.unshift(Prisma.sql`"date" = ${data.date}`);
    }

    if (data.startTime !== undefined) {
      assignments.unshift(Prisma.sql`"startTime" = ${data.startTime}`);
    }

    if (data.endTime !== undefined) {
      assignments.unshift(Prisma.sql`"endTime" = ${data.endTime}`);
    }

    if (data.totalWorkingHours !== undefined) {
      assignments.unshift(
        Prisma.sql`"totalWorkingHours" = ${data.totalWorkingHours}`,
      );
    }

    if (data.dayCharge !== undefined) {
      assignments.unshift(Prisma.sql`"dayCharge" = ${data.dayCharge}`);
    }

    if (data.notes !== undefined) {
      assignments.unshift(Prisma.sql`"notes" = ${data.notes}`);
    }

    if (data.status !== undefined) {
      assignments.unshift(Prisma.sql`"status" = ${data.status}`);
    }

    const result = await prisma.$queryRaw<
      ProjectUserDailyLogRecord[]
    >(Prisma.sql`
      UPDATE "ProjectUserDailyLog"
      SET ${Prisma.join(assignments)}
      WHERE "id" = ${id}
        AND "domainId" = ${domainId}
        AND "adminId" = ${adminId}
        AND "isDeleted" = false
      RETURNING ${projectUserDailyLogSelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<ProjectUserDailyLogRecord | null> => {
    const result = await prisma.$queryRaw<
      ProjectUserDailyLogRecord[]
    >(Prisma.sql`
      UPDATE "ProjectUserDailyLog"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE "id" = ${id}
        AND "domainId" = ${domainId}
        AND "adminId" = ${adminId}
        AND "isDeleted" = false
      RETURNING ${projectUserDailyLogSelect}
    `);

    return result[0] ?? null;
  },
};
