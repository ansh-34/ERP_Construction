import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type JsonObject = Record<string, unknown>;
type RelationDetails = Record<string, unknown> | null;

export interface ProjectRecord {
  id: string;
  name: JsonObject;
  code: string;
  searchText: string;
  description: string | null;
  budget: number;
  spent: number;
  expectedStartDate: Date | null;
  expectedEndDate: Date | null;
  actualStartDate: Date | null;
  actualEndDate: Date | null;
  progress?: number;
  totalDelayInDays?: number;
  locationId: string;
  domainId: string;
  adminId: string;
  location?: RelationDetails;
  domain?: RelationDetails;
  admin?: RelationDetails;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: JsonObject;
  code: string;
  searchText: string;
  description?: string | null;
  budget: number;
  spent?: number;
  expectedStartDate?: Date | null;
  expectedEndDate?: Date | null;
  locationId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateProjectInput {
  name?: JsonObject;
  code?: string;
  description?: string | null;
  searchText?: string;
  budget?: number;
  spent?: number;
  actualStartDate?: Date | null;
  actualEndDate?: Date | null;
  locationId?: string;
  status?: StatusEnum;
}

const projectSelect = Prisma.sql`
  "id",
  "name",
  "code",
  "description",
  "budget",
  "spent",
  "expectedStartDate",
  "expectedEndDate",
  "actualStartDate",
  "actualEndDate",
  "locationId",
  "domainId",
  "adminId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

export const projectProgressSql = Prisma.sql`
  COALESCE((
    SELECT ROUND(AVG(stage_progress."progress")::numeric, 2)::float
    FROM (
      SELECT COALESCE(AVG(LEAST(GREATEST(pt."taskProgress", 0), 100)), 0) AS "progress"
      FROM "ProjectStage" ps
      LEFT JOIN "ProjectTask" pt ON pt."stageId" = ps."id"
        AND pt."domainId" = ps."domainId"
        AND pt."isDeleted" = false
        AND pt."status" = ${StatusEnum.ACTIVE}
      WHERE ps."projectId" = p."id"
        AND ps."domainId" = p."domainId"
        AND ps."isDeleted" = false
        AND ps."status" = ${StatusEnum.ACTIVE}
      GROUP BY ps."id"
    ) stage_progress
  ), 0)
`;

const projectListSelect = Prisma.sql`
  p."id",
  p."name",
  p."code",
  p."description",
  p."budget",
  p."spent",
  p."expectedStartDate",
  p."expectedEndDate",
  p."actualStartDate",
  p."actualEndDate",
  p."locationId",
  p."domainId",
  p."adminId",
  ${projectProgressSql} AS "progress",
  COALESCE((
    SELECT SUM(pt."totalDelayInDays")::float
    FROM "ProjectTask" pt
    WHERE pt."projectId" = p."id"
      AND pt."domainId" = p."domainId"
      AND pt."isDeleted" = false
      AND pt."status" = ${StatusEnum.ACTIVE}
  ), 0) AS "totalDelayInDays",
  jsonb_build_object(
    'locationId', l."id",
    'name', l."name",
    'code', l."code"
  ) AS "location",
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
  p."status",
  p."isDeleted",
  p."createdAt",
  p."updatedAt"
`;

const projectDetailSelect = Prisma.sql`
  p."id",
  p."name",
  p."code",
  p."description",
  p."budget",
  p."spent",
  p."expectedStartDate",
  p."expectedEndDate",
  p."actualStartDate",
  p."actualEndDate",
  ${projectProgressSql} AS "progress",
  COALESCE((
    SELECT SUM(pt."totalDelayInDays")::float
    FROM "ProjectTask" pt
    WHERE pt."projectId" = p."id"
      AND pt."domainId" = p."domainId"
      AND pt."isDeleted" = false
      AND pt."status" = ${StatusEnum.ACTIVE}
  ), 0) AS "totalDelayInDays",
  p."locationId",
  p."domainId",
  p."adminId",
  jsonb_build_object(
    'locationId', l."id",
    'name', l."name",
    'code', l."code",
    'type', l."type",
    'parentLocationId', l."parentLocationId",
    'status', l."status"
  ) AS "location",
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
  p."status",
  p."isDeleted",
  p."createdAt",
  p."updatedAt"
`;

export const projectRepository = {
  countProjects<T extends Prisma.ProjectCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.ProjectCountArgs>,
  ) {
    return prisma.project.count(args);
  },

  aggregateProjects<T extends Prisma.ProjectAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.ProjectAggregateArgs>,
  ) {
    return prisma.project.aggregate(args);
  },

  countProjectTaskDelays<T extends Prisma.ProjectTaskDelayCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.ProjectTaskDelayCountArgs>,
  ) {
    return prisma.projectTaskDelay.count(args);
  },

  aggregateProjectTaskDelays<T extends Prisma.ProjectTaskDelayAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.ProjectTaskDelayAggregateArgs>,
  ) {
    return prisma.projectTaskDelay.aggregate(args);
  },

  countProjectTasks<T extends Prisma.ProjectTaskCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.ProjectTaskCountArgs>,
  ) {
    return prisma.projectTask.count(args);
  },

  create: async (
    data: CreateProjectInput,
    options: { transaction?: any } = {},
  ): Promise<ProjectRecord> => {
    const prismaClient = options.transaction || prisma;
    const id = randomUUID();

    const result = (await prismaClient.$queryRaw(Prisma.sql`
      INSERT INTO "Project" ("id", "name", "code", "searchText", "description", "budget", "spent", "expectedStartDate", "expectedEndDate", "actualStartDate", "actualEndDate", "locationId", "domainId", "adminId", "status", "isDeleted", "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${JSON.stringify(data.name)}::jsonb,
        ${data.code},
        ${data.searchText},
        ${data.description ?? null},
        ${data.budget},
        ${data.spent ?? 0},
        ${data.expectedStartDate ?? null},
        ${data.expectedEndDate ?? null},
        NULL,
        NULL,
        ${data.locationId},
        ${data.domainId},
        ${data.adminId},
        ${data.status},
        false,
        NOW(),
        NOW()
      )
      RETURNING *
    `)) as ProjectRecord[];

    return result[0] as ProjectRecord;
  },

  count(options: {
    filters: {
      domainId?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      adminId?: string;
      actualStartDate?: any;
      actualEndDate?: any;
    };
  }) {
    const whereClause: any = {
      isDeleted: false,
      ...(options.filters && {
        ...(options.filters.domainId && { domainId: options.filters.domainId }),
        ...(options.filters.status && { status: options.filters.status }),
        ...(options.filters.searchKey && {
          searchText: { contains: options.filters.searchKey },
        }),
        ...(options.filters.adminId && { adminId: options.filters.adminId }),
        ...(options.filters.actualStartDate && {
          actualStartDate: options.filters.actualStartDate,
        }),
        ...(options.filters.actualEndDate && {
          actualEndDate: options.filters.actualEndDate,
        }),
      }),
    };

    return prisma.project.count({ where: whereClause });
  },

  find: async (options: {
    filters: { spent?: any; budget?: any; domainId?: any; status?: any };
    orderBy?: any;
    select?: any;
    limit?: any;
    offset?: any;
  }) => {
    const whereClause: any = {
      isDeleted: false,
      ...(options.filters && {
        ...(options.filters.spent && { spent: options.filters.spent }),
        ...(options.filters.budget && { budget: options.filters.budget }),
        ...(options.filters.domainId && { domainId: options.filters.domainId }),
        ...(options.filters.status && { status: options.filters.status }),
      }),
    };

    return prisma.project.findMany({
      where: whereClause,
      ...(options.orderBy && { orderBy: options.orderBy }),
      ...(options.select && { select: options.select }),
      ...(options.limit && { take: options.limit }),
      ...(options.offset && { skip: options.offset }),
    });
  },

  findMany: async (
    domainId: string,
    searchKey?: string,
    adminId?: string,
    status?: StatusEnum,
  ): Promise<ProjectRecord[]> => {
    const filters = [
      Prisma.sql`p."domainId" = ${domainId}`,
      Prisma.sql`p."isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`p."adminId" = ${adminId}`);
    }

    if (status) {
      filters.push(Prisma.sql`p."status" = ${status}`);
    }

    if (searchKey) {
      filters.push(
        Prisma.sql`p."searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      SELECT ${projectListSelect}
      FROM "Project" p
      INNER JOIN "Location" l ON l."id" = p."locationId"
      INNER JOIN "Domain" d ON d."id" = p."domainId"
      INNER JOIN "Admin" a ON a."id" = p."adminId"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY p."createdAt" DESC
    `);
  },

  findManyByIds: async (
    ids: string[],
    domainId: string,
    adminId?: string,
  ): Promise<ProjectRecord[]> => {
    if (ids.length === 0) return [];

    const filters = [
      Prisma.sql`p."id" = ANY(${ids}::uuid[])`,
      Prisma.sql`p."domainId" = ${domainId}`,
      Prisma.sql`p."isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`p."adminId" = ${adminId}`);
    }

    return prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      SELECT ${projectListSelect}
      FROM "Project" p
      INNER JOIN "Location" l ON l."id" = p."locationId"
      INNER JOIN "Domain" d ON d."id" = p."domainId"
      INNER JOIN "Admin" a ON a."id" = p."adminId"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY p."createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<ProjectRecord | null> => {
    const filters = [
      Prisma.sql`p."id" = ${id}`,
      Prisma.sql`p."domainId" = ${domainId}`,
      Prisma.sql`p."isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`p."adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      SELECT ${projectDetailSelect}
      FROM "Project" p
      INNER JOIN "Location" l ON l."id" = p."locationId"
      INNER JOIN "Domain" d ON d."id" = p."domainId"
      INNER JOIN "Admin" a ON a."id" = p."adminId"
      WHERE ${Prisma.join(filters, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findByCode: async (
    code: string,
    domainId: string,
    adminId?: string,
  ): Promise<ProjectRecord | null> => {
    const filters = [
      Prisma.sql`"code" = ${code}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      SELECT ${projectSelect}
      FROM "Project"
      WHERE ${Prisma.join(filters, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectInput,
    adminId?: string,
  ): Promise<ProjectRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.name !== undefined) {
      assignments.unshift(
        Prisma.sql`"name" = ${JSON.stringify(data.name)}::jsonb`,
      );
    }

    if (data.code !== undefined) {
      assignments.unshift(Prisma.sql`"code" = ${data.code}`);
    }

    if (data.description !== undefined) {
      assignments.unshift(Prisma.sql`"description" = ${data.description}`);
    }

    if (data.searchText !== undefined) {
      assignments.unshift(Prisma.sql`"searchText" = ${data.searchText}`);
    }

    if (data.budget !== undefined) {
      assignments.unshift(Prisma.sql`"budget" = ${data.budget}`);
    }

    if (data.spent !== undefined) {
      assignments.unshift(Prisma.sql`"spent" = ${data.spent}`);
    }

    if (data.actualStartDate !== undefined) {
      assignments.unshift(
        Prisma.sql`"actualStartDate" = ${data.actualStartDate}`,
      );
    }

    if (data.actualEndDate !== undefined) {
      assignments.unshift(Prisma.sql`"actualEndDate" = ${data.actualEndDate}`);
    }

    if (data.locationId !== undefined) {
      assignments.unshift(Prisma.sql`"locationId" = ${data.locationId}`);
    }

    if (data.status !== undefined) {
      assignments.unshift(Prisma.sql`"status" = ${data.status}`);
    }

    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      UPDATE "Project"
      SET ${Prisma.join(assignments)}
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${projectSelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<ProjectRecord | null> => {
    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      UPDATE "Project"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${projectSelect}
    `);

    return result[0] ?? null;
  },

  bulkCreate(
    data: CreateProjectInput[],
    options: { skipDuplicates?: boolean; transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.project.createMany({
      data: data.map((item) => ({
        name: item.name,
        code: item.code,
        searchText: item.searchText,
        description: item.description || null,
        budget: item.budget,
        spent: item.spent || 0,
        expectedStartDate: item.expectedStartDate ?? null,
        expectedEndDate: item.expectedEndDate ?? null,
        locationId: item.locationId,
        domainId: item.domainId,
        adminId: item.adminId,
        status: item.status,
      })),
      skipDuplicates: Object.prototype.hasOwnProperty.call(
        options,
        'skipDuplicates',
      )
        ? options.skipDuplicates
        : true,
    });
  },
};
