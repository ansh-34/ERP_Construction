import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type JsonObject = Record<string, unknown>;
type RelationDetails = Record<string, unknown> | null;

export interface ProjectStageRecord {
  id: string;
  name: JsonObject;
  code: string;
  description: string | null;
  progress: number | null;
  expectedStartDate: Date | null;
  expectedEndDate: Date | null;
  actualStartDate: Date | null;
  actualEndDate: Date | null;
  projectId: string | null;
  domainId: string;
  adminId: string;
  project?: RelationDetails;
  domain?: RelationDetails;
  admin?: RelationDetails;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectStageInput {
  name: JsonObject;
  code: string;
  searchText: string;
  description?: string | null;
  progress?: number | null;
  expectedStartDate?: Date | null;
  expectedEndDate?: Date | null;
  projectId?: string | null;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateProjectStageInput {
  name?: JsonObject;
  code?: string;
  description?: string | null;
  searchText?: string;
  progress?: number | null;
  actualStartDate?: Date | null;
  actualEndDate?: Date | null;
  status?: StatusEnum;
}

const projectStageSelect = Prisma.sql`
  "id",
  "name",
  "code",
  "description",
  "progress",
  "expectedStartDate",
  "expectedEndDate",
  "actualStartDate",
  "actualEndDate",
  "projectId",
  "domainId",
  "adminId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

const projectStageListSelect = Prisma.sql`
  ps."id",
  ps."name",
  ps."code",
  ps."description",
  ps."expectedStartDate",
  ps."expectedEndDate",
  ps."actualStartDate",
  ps."actualEndDate",
  ps."projectId",
  ps."domainId",
  ps."adminId",
  COALESCE((
    SELECT ROUND(AVG(LEAST(GREATEST(pt."taskProgress", 0), 100))::numeric, 2)::float
    FROM "ProjectTask" pt
    WHERE pt."stageId" = ps."id"
      AND pt."domainId" = ps."domainId"
      AND pt."isDeleted" = false
      AND pt."status" = ${StatusEnum.ACTIVE}
  ), 0) AS "progress",
  CASE
    WHEN p."id" IS NULL THEN NULL
    ELSE jsonb_build_object(
      'projectId', p."id",
      'name', p."name",
      'code', p."code",
      'progress', COALESCE((
        SELECT ROUND(AVG(stage_progress."progress")::numeric, 2)::float
        FROM (
          SELECT COALESCE(AVG(LEAST(GREATEST(pt."taskProgress", 0), 100)), 0) AS "progress"
          FROM "ProjectStage" project_stages
          LEFT JOIN "ProjectTask" pt ON pt."stageId" = project_stages."id"
            AND pt."domainId" = project_stages."domainId"
            AND pt."isDeleted" = false
            AND pt."status" = ${StatusEnum.ACTIVE}
          WHERE project_stages."projectId" = p."id"
            AND project_stages."domainId" = p."domainId"
            AND project_stages."isDeleted" = false
            AND project_stages."status" = ${StatusEnum.ACTIVE}
          GROUP BY project_stages."id"
        ) stage_progress
      ), 0)
    )
  END AS "project",
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
  ps."status",
  ps."isDeleted",
  ps."createdAt",
  ps."updatedAt"
`;

const projectStageDetailSelect = Prisma.sql`
  ps."id",
  ps."name",
  ps."code",
  ps."description",
  ps."expectedStartDate",
  ps."expectedEndDate",
  ps."actualStartDate",
  ps."actualEndDate",
  COALESCE((
    SELECT ROUND(AVG(LEAST(GREATEST(pt."taskProgress", 0), 100))::numeric, 2)::float
    FROM "ProjectTask" pt
    WHERE pt."stageId" = ps."id"
      AND pt."domainId" = ps."domainId"
      AND pt."isDeleted" = false
      AND pt."status" = ${StatusEnum.ACTIVE}
  ), 0) AS "progress",
  ps."projectId",
  ps."domainId",
  ps."adminId",
  CASE
    WHEN p."id" IS NULL THEN NULL
    ELSE jsonb_build_object(
      'projectId', p."id",
      'name', p."name",
      'code', p."code",
      'description', p."description",
      'budget', p."budget",
      'spent', p."spent",
      'progress', COALESCE((
        SELECT ROUND(AVG(stage_progress."progress")::numeric, 2)::float
        FROM (
          SELECT COALESCE(AVG(LEAST(GREATEST(pt."taskProgress", 0), 100)), 0) AS "progress"
          FROM "ProjectStage" project_stages
          LEFT JOIN "ProjectTask" pt ON pt."stageId" = project_stages."id"
            AND pt."domainId" = project_stages."domainId"
            AND pt."isDeleted" = false
            AND pt."status" = ${StatusEnum.ACTIVE}
          WHERE project_stages."projectId" = p."id"
            AND project_stages."domainId" = p."domainId"
            AND project_stages."isDeleted" = false
            AND project_stages."status" = ${StatusEnum.ACTIVE}
          GROUP BY project_stages."id"
        ) stage_progress
      ), 0),
      'locationId', p."locationId",
      'location', CASE
        WHEN l."id" IS NULL THEN NULL
        ELSE jsonb_build_object(
          'locationId', l."id",
          'name', l."name",
          'code', l."code",
          'type', l."type",
          'parentLocationId', l."parentLocationId",
          'status', l."status"
        )
      END,
      'status', p."status"
    )
  END AS "project",
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
  ps."status",
  ps."isDeleted",
  ps."createdAt",
  ps."updatedAt"
`;

export const projectStageRepository = {
  recalculateProgress: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<ProjectStageRecord | null> => {
    const filters = [
      Prisma.sql`ps."id" = ${id}`,
      Prisma.sql`ps."domainId" = ${domainId}`,
      Prisma.sql`ps."isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`ps."adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectStageRecord[]>(Prisma.sql`
      UPDATE "ProjectStage" ps
      SET
        "progress" = COALESCE((
          SELECT ROUND(AVG(LEAST(GREATEST(pt."taskProgress", 0), 100))::numeric, 2)::float
          FROM "ProjectTask" pt
          WHERE pt."stageId" = ps."id"
            AND pt."domainId" = ps."domainId"
            AND pt."isDeleted" = false
            AND pt."status" = ${StatusEnum.ACTIVE}
        ), 0),
        "updatedAt" = NOW()
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${projectStageSelect}
    `);

    return result[0] ?? null;
  },

  create: async (
    data: CreateProjectStageInput,
  ): Promise<ProjectStageRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<ProjectStageRecord[]>(Prisma.sql`
      INSERT INTO "ProjectStage" ("id", "name", "code", "searchText", "description", "progress", "expectedStartDate", "expectedEndDate", "actualStartDate", "actualEndDate", "projectId", "domainId", "adminId", "status", "isDeleted", "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${JSON.stringify(data.name)}::jsonb,
        ${data.code},
        ${data.searchText},
        ${data.description ?? null},
        ${data.progress ?? null},
        ${data.expectedStartDate ?? null},
        ${data.expectedEndDate ?? null},
        NULL,
        NULL,
        ${data.projectId ?? null},
        ${data.domainId},
        ${data.adminId},
        ${data.status},
        false,
        NOW(),
        NOW()
      )
      RETURNING *
    `);

    return result[0] as ProjectStageRecord;
  },

  findMany: async (
    domainId: string,
    projectId: string,
    adminId?: string,
    searchKey?: string,
  ): Promise<ProjectStageRecord[]> => {
    const filters = [
      Prisma.sql`ps."domainId" = ${domainId}`,
      Prisma.sql`ps."projectId" = ${projectId}`,
      Prisma.sql`ps."isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`ps."adminId" = ${adminId}`);
    }

    if (searchKey) {
      filters.push(
        Prisma.sql`ps."searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<ProjectStageRecord[]>(Prisma.sql`
      SELECT ${projectStageListSelect}
      FROM "ProjectStage" ps
      LEFT JOIN "Project" p ON p."id" = ps."projectId"
      LEFT JOIN "Location" l ON l."id" = p."locationId"
      INNER JOIN "Domain" d ON d."id" = ps."domainId"
      INNER JOIN "Admin" a ON a."id" = ps."adminId"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY ps."createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<ProjectStageRecord | null> => {
    const filters = [
      Prisma.sql`ps."id" = ${id}`,
      Prisma.sql`ps."domainId" = ${domainId}`,
      Prisma.sql`ps."isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`ps."adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectStageRecord[]>(Prisma.sql`
      SELECT ${projectStageDetailSelect}
      FROM "ProjectStage" ps
      LEFT JOIN "Project" p ON p."id" = ps."projectId"
      LEFT JOIN "Location" l ON l."id" = p."locationId"
      INNER JOIN "Domain" d ON d."id" = ps."domainId"
      INNER JOIN "Admin" a ON a."id" = ps."adminId"
      WHERE ${Prisma.join(filters, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findByCode: async (
    code: string,
    domainId: string,
    projectId?: string | null,
    adminId?: string,
  ): Promise<ProjectStageRecord | null> => {
    const filters = [
      Prisma.sql`"code" = ${code}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    filters.push(
      projectId === null || projectId === undefined
        ? Prisma.sql`"projectId" IS NULL`
        : Prisma.sql`"projectId" = ${projectId}`,
    );

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectStageRecord[]>(Prisma.sql`
      SELECT ${projectStageSelect}
      FROM "ProjectStage"
      WHERE ${Prisma.join(filters, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectStageInput,
    adminId?: string,
  ): Promise<ProjectStageRecord | null> => {
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

    if (data.progress !== undefined) {
      assignments.unshift(Prisma.sql`"progress" = ${data.progress}`);
    }

    if (data.actualStartDate !== undefined) {
      assignments.unshift(
        Prisma.sql`"actualStartDate" = ${data.actualStartDate}`,
      );
    }

    if (data.actualEndDate !== undefined) {
      assignments.unshift(Prisma.sql`"actualEndDate" = ${data.actualEndDate}`);
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

    const result = await prisma.$queryRaw<ProjectStageRecord[]>(Prisma.sql`
      UPDATE "ProjectStage"
      SET ${Prisma.join(assignments)}
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${projectStageSelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<ProjectStageRecord | null> => {
    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectStageRecord[]>(Prisma.sql`
      UPDATE "ProjectStage"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${projectStageSelect}
    `);

    return result[0] ?? null;
  },

  bulkCreate(
    data: CreateProjectStageInput[],
    options: { skipDuplicates?: boolean; transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.projectStage.createMany({
      data: data.map((item) => ({
        name: item.name,
        code: item.code,
        searchText: item.searchText,
        description: item.description || null,
        progress: item.progress || null,
        expectedStartDate: item.expectedStartDate ?? null,
        expectedEndDate: item.expectedEndDate ?? null,
        projectId: item.projectId ?? null,
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
