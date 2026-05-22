import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type RelationDetails = Record<string, unknown> | null;

export interface ProjectUserAssignmentRecord {
  id: string;
  startDate: Date;
  endDate: Date;
  projectId: string;
  userId: string;
  dailyWorkingHours: number;
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

export interface CreateProjectUserAssignmentInput {
  startDate: Date;
  endDate: Date;
  projectId: string;
  userId: string;
  dailyWorkingHours: number;
  dayCharge: number;
  notes?: string | null;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateProjectUserAssignmentInput {
  startDate?: Date;
  endDate?: Date;
  dailyWorkingHours?: number;
  dayCharge?: number;
  notes?: string | null;
  status?: StatusEnum;
}

const projectUserAssignmentSelect = Prisma.sql`
  "id",
  "startDate",
  "endDate",
  "projectId",
  "userId",
  "dailyWorkingHours",
  "dayCharge",
  "notes",
  "domainId",
  "adminId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

const projectUserAssignmentListSelect = Prisma.sql`
  pua."id",
  pua."startDate",
  pua."endDate",
  pua."projectId",
  pua."userId",
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
  pua."dailyWorkingHours",
  pua."dayCharge",
  pua."notes",
  pua."domainId",
  pua."adminId",
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
  pua."status",
  pua."isDeleted",
  pua."createdAt",
  pua."updatedAt"
`;

const projectUserAssignmentDetailSelect = Prisma.sql`
  pua."id",
  pua."startDate",
  pua."endDate",
  pua."projectId",
  pua."userId",
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
  pua."dailyWorkingHours",
  pua."dayCharge",
  pua."notes",
  pua."domainId",
  pua."adminId",
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
  pua."status",
  pua."isDeleted",
  pua."createdAt",
  pua."updatedAt"
`;

export const projectUserAssignmentRepository = {
  createMany: async (
    data: CreateProjectUserAssignmentInput[],
  ): Promise<ProjectUserAssignmentRecord[]> => {
    if (!data.length) return [];

    const rows = data.map((item) => ({
      id: randomUUID(),
      ...item,
      notes: item.notes ?? null,
    }));

    return prisma
      .$transaction(
        rows.map((row) =>
          prisma.$queryRaw<ProjectUserAssignmentRecord[]>(Prisma.sql`
          INSERT INTO "ProjectUserAssignment" (
            "id",
            "startDate",
            "endDate",
            "projectId",
            "userId",
            "dailyWorkingHours",
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
            ${row.startDate},
            ${row.endDate},
            ${row.projectId},
            ${row.userId},
            ${row.dailyWorkingHours},
            ${row.dayCharge},
            ${row.notes},
            ${row.domainId},
            ${row.adminId},
            ${row.status},
            false,
            NOW(),
            NOW()
          )
          RETURNING ${projectUserAssignmentSelect}
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
      startDate?: Date;
      endDate?: Date;
      currentDate?: Date;
      searchKey?: string;
    } = {},
  ): Promise<ProjectUserAssignmentRecord[]> => {
    const where = [
      Prisma.sql`pua."domainId" = ${domainId}`,
      Prisma.sql`pua."adminId" = ${adminId}`,
      Prisma.sql`pua."isDeleted" = false`,
    ];

    if (filters.projectId) {
      where.push(Prisma.sql`pua."projectId" = ${filters.projectId}`);
    }

    if (filters.userId) {
      where.push(Prisma.sql`pua."userId" = ${filters.userId}`);
    }

    if (filters.startDate) {
      where.push(Prisma.sql`pua."endDate" >= ${filters.startDate}`);
    }

    if (filters.endDate) {
      where.push(Prisma.sql`pua."startDate" <= ${filters.endDate}`);
    }

    if (filters.currentDate) {
      where.push(Prisma.sql`pua."startDate" <= ${filters.currentDate}`);
      where.push(Prisma.sql`pua."endDate" >= ${filters.currentDate}`);
    }

    if (filters.searchKey) {
      const search = `%${filters.searchKey.toLowerCase()}%`;
      where.push(Prisma.sql`(
        LOWER(u."name") LIKE ${search}
        OR LOWER(u."email") LIKE ${search}
        OR LOWER(p."code") LIKE ${search}
        OR LOWER(pua."notes") LIKE ${search}
      )`);
    }

    return prisma.$queryRaw<ProjectUserAssignmentRecord[]>(Prisma.sql`
      SELECT ${projectUserAssignmentListSelect}
      FROM "ProjectUserAssignment" pua
      INNER JOIN "Project" p ON p."id" = pua."projectId"
      INNER JOIN "User" u ON u."id" = pua."userId"
      INNER JOIN "Domain" d ON d."id" = pua."domainId"
      INNER JOIN "Admin" a ON a."id" = pua."adminId"
      WHERE ${Prisma.join(where, ' AND ')}
      ORDER BY pua."createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<ProjectUserAssignmentRecord | null> => {
    const result = await prisma.$queryRaw<
      ProjectUserAssignmentRecord[]
    >(Prisma.sql`
      SELECT ${projectUserAssignmentDetailSelect}
      FROM "ProjectUserAssignment" pua
      INNER JOIN "Project" p ON p."id" = pua."projectId"
      INNER JOIN "User" u ON u."id" = pua."userId"
      INNER JOIN "Domain" d ON d."id" = pua."domainId"
      INNER JOIN "Admin" a ON a."id" = pua."adminId"
      WHERE pua."id" = ${id}
        AND pua."domainId" = ${domainId}
        AND pua."adminId" = ${adminId}
        AND pua."isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findMissingUserIds: async (
    userIds: string[],
    domainId: string,
  ): Promise<string[]> => {
    if (!userIds.length) return [];

    const users = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT "id"
      FROM "User"
      WHERE "id" = ANY(${userIds}::uuid[])
        AND "domainId" = ${domainId}
        AND "isDeleted" = false
    `);

    const foundIds = new Set(users.map((user) => user.id));
    return userIds.filter((userId) => !foundIds.has(userId));
  },

  findOverlappingAssignments: async (
    assignments: {
      projectId: string;
      userId: string;
      startDate: Date;
      endDate: Date;
    }[],
    domainId: string,
    adminId: string,
    excludeId?: string,
  ): Promise<ProjectUserAssignmentRecord[]> => {
    if (!assignments.length) return [];

    const filters = assignments.map(
      (assignment) =>
        Prisma.sql`(
        "projectId" = ${assignment.projectId}
        AND "userId" = ${assignment.userId}
        AND "startDate" <= ${assignment.endDate}
        AND "endDate" >= ${assignment.startDate}
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

    return prisma.$queryRaw<ProjectUserAssignmentRecord[]>(Prisma.sql`
      SELECT ${projectUserAssignmentSelect}
      FROM "ProjectUserAssignment"
      WHERE ${Prisma.join(baseFilters, ' AND ')}
        AND (${Prisma.join(filters, ' OR ')})
    `);
  },

  update: async (
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateProjectUserAssignmentInput,
  ): Promise<ProjectUserAssignmentRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.startDate !== undefined) {
      assignments.unshift(Prisma.sql`"startDate" = ${data.startDate}`);
    }

    if (data.endDate !== undefined) {
      assignments.unshift(Prisma.sql`"endDate" = ${data.endDate}`);
    }

    if (data.dailyWorkingHours !== undefined) {
      assignments.unshift(
        Prisma.sql`"dailyWorkingHours" = ${data.dailyWorkingHours}`,
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
      ProjectUserAssignmentRecord[]
    >(Prisma.sql`
      UPDATE "ProjectUserAssignment"
      SET ${Prisma.join(assignments)}
      WHERE "id" = ${id}
        AND "domainId" = ${domainId}
        AND "adminId" = ${adminId}
        AND "isDeleted" = false
      RETURNING ${projectUserAssignmentSelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<ProjectUserAssignmentRecord | null> => {
    const result = await prisma.$queryRaw<
      ProjectUserAssignmentRecord[]
    >(Prisma.sql`
      UPDATE "ProjectUserAssignment"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE "id" = ${id}
        AND "domainId" = ${domainId}
        AND "adminId" = ${adminId}
        AND "isDeleted" = false
      RETURNING ${projectUserAssignmentSelect}
    `);

    return result[0] ?? null;
  },
};
