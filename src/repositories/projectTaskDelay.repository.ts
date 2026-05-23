import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type JsonObject = Record<string, unknown>;
type RelationDetails = Record<string, unknown> | null;

export interface ProjectTaskDelayRecord {
  id: string;
  taskId: string;
  requestedDelayInDays: number;
  delayReason: JsonObject;
  requestApproved: boolean | null;
  requestApprovalTime: Date | null;
  stageId: string;
  projectId: string;
  domainId: string;
  adminId: string;
  task?: RelationDetails;
  stage?: RelationDetails;
  project?: RelationDetails;
  domain?: RelationDetails;
  admin?: RelationDetails;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectTaskDelayInput {
  taskId: string;
  requestedDelayInDays: number;
  delayReason: JsonObject;
  searchText: string;
  requestApproved?: boolean | null;
  requestApprovalTime?: Date | null;
  stageId: string;
  projectId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateProjectTaskDelayInput {
  requestedDelayInDays?: number;
  delayReason?: JsonObject;
  searchText?: string;
  requestApproved?: boolean | null;
  requestApprovalTime?: Date | null;
  status?: StatusEnum;
}

const projectTaskDelaySelect = Prisma.sql`
  "id",
  "taskId",
  "requestedDelayInDays",
  "delayReason",
  "requestApproved",
  "requestApprovalTime",
  "stageId",
  "projectId",
  "domainId",
  "adminId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

const projectTaskDelayListSelect = Prisma.sql`
  ptd."id",
  ptd."requestedDelayInDays",
  ptd."delayReason",
  ptd."requestApproved",
  ptd."requestApprovalTime",
  ptd."taskId",
  ptd."stageId",
  ptd."projectId",
  ptd."domainId",
  ptd."adminId",
  jsonb_build_object(
    'taskId', pt."id",
    'name', pt."name",
    'code', pt."code",
    'taskStatus', pt."taskStatus"
  ) AS "task",
  jsonb_build_object(
    'stageId', ps."id",
    'name', ps."name",
    'code', ps."code",
    'progress', COALESCE((
      SELECT ROUND(AVG(LEAST(GREATEST(stage_tasks."taskProgress", 0), 100))::numeric, 2)::float
      FROM "ProjectTask" stage_tasks
      WHERE stage_tasks."stageId" = ps."id"
        AND stage_tasks."domainId" = ps."domainId"
        AND stage_tasks."isDeleted" = false
        AND stage_tasks."status" = ${StatusEnum.ACTIVE}
    ), 0)
  ) AS "stage",
  jsonb_build_object(
    'projectId', p."id",
    'name', p."name",
    'code', p."code",
    'progress', COALESCE((
      SELECT ROUND(AVG(stage_progress."progress")::numeric, 2)::float
      FROM (
        SELECT COALESCE(AVG(LEAST(GREATEST(project_tasks."taskProgress", 0), 100)), 0) AS "progress"
        FROM "ProjectStage" project_stages
        LEFT JOIN "ProjectTask" project_tasks ON project_tasks."stageId" = project_stages."id"
          AND project_tasks."domainId" = project_stages."domainId"
          AND project_tasks."isDeleted" = false
          AND project_tasks."status" = ${StatusEnum.ACTIVE}
        WHERE project_stages."projectId" = p."id"
          AND project_stages."domainId" = p."domainId"
          AND project_stages."isDeleted" = false
          AND project_stages."status" = ${StatusEnum.ACTIVE}
        GROUP BY project_stages."id"
      ) stage_progress
    ), 0)
  ) AS "project",
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
  ptd."status",
  ptd."isDeleted",
  ptd."createdAt",
  ptd."updatedAt"
`;

const projectTaskDelayDetailSelect = Prisma.sql`
  ptd."id",
  ptd."taskId",
  ptd."requestedDelayInDays",
  ptd."delayReason",
  ptd."requestApproved",
  ptd."requestApprovalTime",
  ptd."stageId",
  ptd."projectId",
  ptd."domainId",
  ptd."adminId",
  jsonb_build_object(
    'taskId', pt."id",
    'name', pt."name",
    'code', pt."code",
    'taskStatus', pt."taskStatus",
    'taskProgress', pt."taskProgress",
    'assignee', pt."assignee",
    'assigneeDetails', CASE
      WHEN u."id" IS NULL THEN NULL
      ELSE jsonb_build_object(
        'userId', u."id",
        'name', u."name",
        'email', u."email",
        'phoneCode', u."phoneCode",
        'phone', u."phone",
        'roleId', u."roleId",
        'status', u."status"
      )
    END,
    'status', pt."status"
  ) AS "task",
  jsonb_build_object(
    'stageId', ps."id",
    'name', ps."name",
    'code', ps."code",
    'description', ps."description",
    'progress', COALESCE((
      SELECT ROUND(AVG(LEAST(GREATEST(stage_tasks."taskProgress", 0), 100))::numeric, 2)::float
      FROM "ProjectTask" stage_tasks
      WHERE stage_tasks."stageId" = ps."id"
        AND stage_tasks."domainId" = ps."domainId"
        AND stage_tasks."isDeleted" = false
        AND stage_tasks."status" = ${StatusEnum.ACTIVE}
    ), 0),
    'status', ps."status"
  ) AS "stage",
  jsonb_build_object(
    'projectId', p."id",
    'name', p."name",
    'code', p."code",
    'description', p."description",
    'budget', p."budget",
    'spent', p."spent",
    'progress', COALESCE((
      SELECT ROUND(AVG(stage_progress."progress")::numeric, 2)::float
      FROM (
        SELECT COALESCE(AVG(LEAST(GREATEST(project_tasks."taskProgress", 0), 100)), 0) AS "progress"
        FROM "ProjectStage" project_stages
        LEFT JOIN "ProjectTask" project_tasks ON project_tasks."stageId" = project_stages."id"
          AND project_tasks."domainId" = project_stages."domainId"
          AND project_tasks."isDeleted" = false
          AND project_tasks."status" = ${StatusEnum.ACTIVE}
        WHERE project_stages."projectId" = p."id"
          AND project_stages."domainId" = p."domainId"
          AND project_stages."isDeleted" = false
          AND project_stages."status" = ${StatusEnum.ACTIVE}
        GROUP BY project_stages."id"
      ) stage_progress
    ), 0),
    'locationId', p."locationId",
    'location', jsonb_build_object(
      'locationId', l."id",
      'name', l."name",
      'code', l."code",
      'type', l."type",
      'parentLocationId', l."parentLocationId",
      'status', l."status"
    ),
    'status', p."status"
  ) AS "project",
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
  ptd."status",
  ptd."isDeleted",
  ptd."createdAt",
  ptd."updatedAt"
`;

function toDateSql(value: Date | null | undefined): Prisma.Sql {
  return value === null || value === undefined
    ? Prisma.sql`NULL`
    : Prisma.sql`${value}`;
}

function toJsonbSql(value: JsonObject): Prisma.Sql {
  return Prisma.sql`${JSON.stringify(value)}::jsonb`;
}

export const projectTaskDelayRepository = {
  create: async (
    data: CreateProjectTaskDelayInput,
  ): Promise<ProjectTaskDelayRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<ProjectTaskDelayRecord[]>(Prisma.sql`
      INSERT INTO "ProjectTaskDelay" (
        "id",
        "taskId",
        "requestedDelayInDays",
        "delayReason",
        "searchText",
        "requestApproved",
        "requestApprovalTime",
        "stageId",
        "projectId",
        "domainId",
        "adminId",
        "status",
        "isDeleted",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${id},
        ${data.taskId},
        ${data.requestedDelayInDays},
        ${toJsonbSql(data.delayReason)},
        ${data.searchText},
        ${data.requestApproved ?? null},
        ${toDateSql(data.requestApprovalTime)},
        ${data.stageId},
        ${data.projectId},
        ${data.domainId},
        ${data.adminId},
        ${data.status},
        false,
        NOW(),
        NOW()
      )
      RETURNING ${projectTaskDelaySelect}
    `);

    return result[0] as ProjectTaskDelayRecord;
  },

  findMany: async (
    domainId: string,
    adminId?: string,
    projectId?: string,
    stageId?: string,
    taskId?: string,
    searchKey?: string,
  ): Promise<ProjectTaskDelayRecord[]> => {
    const filters = [
      Prisma.sql`ptd."domainId" = ${domainId}`,
      Prisma.sql`ptd."isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`ptd."adminId" = ${adminId}`);
    }

    if (projectId) {
      filters.push(Prisma.sql`ptd."projectId" = ${projectId}`);
    }

    if (stageId) {
      filters.push(Prisma.sql`ptd."stageId" = ${stageId}`);
    }

    if (taskId) {
      filters.push(Prisma.sql`ptd."taskId" = ${taskId}`);
    }

    if (searchKey) {
      filters.push(
        Prisma.sql`ptd."searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<ProjectTaskDelayRecord[]>(Prisma.sql`
      SELECT ${projectTaskDelayListSelect}
      FROM "ProjectTaskDelay" ptd
      INNER JOIN "ProjectTask" pt ON pt."id" = ptd."taskId"
      INNER JOIN "ProjectStage" ps ON ps."id" = ptd."stageId"
      INNER JOIN "Project" p ON p."id" = ptd."projectId"
      INNER JOIN "Location" l ON l."id" = p."locationId"
      INNER JOIN "Domain" d ON d."id" = ptd."domainId"
      INNER JOIN "Admin" a ON a."id" = ptd."adminId"
      LEFT JOIN "User" u ON u."id" = (pt."assignee"->>'userId')::uuid
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY ptd."createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<ProjectTaskDelayRecord | null> => {
    const filters = [
      Prisma.sql`ptd."id" = ${id}`,
      Prisma.sql`ptd."domainId" = ${domainId}`,
      Prisma.sql`ptd."isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`ptd."adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectTaskDelayRecord[]>(Prisma.sql`
      SELECT ${projectTaskDelayDetailSelect}
      FROM "ProjectTaskDelay" ptd
      INNER JOIN "ProjectTask" pt ON pt."id" = ptd."taskId"
      INNER JOIN "ProjectStage" ps ON ps."id" = ptd."stageId"
      INNER JOIN "Project" p ON p."id" = ptd."projectId"
      INNER JOIN "Location" l ON l."id" = p."locationId"
      INNER JOIN "Domain" d ON d."id" = ptd."domainId"
      INNER JOIN "Admin" a ON a."id" = ptd."adminId"
      LEFT JOIN "User" u ON u."id" = (pt."assignee"->>'userId')::uuid
      WHERE ${Prisma.join(filters, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectTaskDelayInput,
    adminId?: string,
  ): Promise<ProjectTaskDelayRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.requestedDelayInDays !== undefined) {
      assignments.unshift(
        Prisma.sql`"requestedDelayInDays" = ${data.requestedDelayInDays}`,
      );
    }

    if (data.delayReason !== undefined) {
      assignments.unshift(
        Prisma.sql`"delayReason" = ${toJsonbSql(data.delayReason)}`,
      );
    }

    if (data.searchText !== undefined) {
      assignments.unshift(Prisma.sql`"searchText" = ${data.searchText}`);
    }

    if (data.requestApproved !== undefined) {
      assignments.unshift(
        Prisma.sql`"requestApproved" = ${data.requestApproved}`,
      );
    }

    if (data.requestApprovalTime !== undefined) {
      assignments.unshift(
        Prisma.sql`"requestApprovalTime" = ${toDateSql(
          data.requestApprovalTime,
        )}`,
      );
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

    const result = await prisma.$queryRaw<ProjectTaskDelayRecord[]>(Prisma.sql`
      UPDATE "ProjectTaskDelay"
      SET ${Prisma.join(assignments)}
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${projectTaskDelaySelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<ProjectTaskDelayRecord | null> => {
    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectTaskDelayRecord[]>(Prisma.sql`
      UPDATE "ProjectTaskDelay"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${projectTaskDelaySelect}
    `);

    return result[0] ?? null;
  },

  bulkCreate(
    data: CreateProjectTaskDelayInput[],
    options: { skipDuplicates?: boolean; transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;

    return prismaClient.projectTaskDelay.createMany({
      data: data.map((item) => ({
        taskId: item.taskId,
        requestedDelayInDays: item.requestedDelayInDays,
        delayReason: item.delayReason,
        searchText: item.searchText,
        requestApproved: item.requestApproved ?? null,
        requestApprovalTime: item.requestApprovalTime || null,
        stageId: item.stageId,
        projectId: item.projectId,
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
