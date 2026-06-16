import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type JsonObject = Record<string, unknown>;
type MachineryType = string | JsonObject;

export interface MachineryRecord {
  id: string;
  code: string;
  type: MachineryType;
  searchText: string;
  expectedLitrePerHour: number | null;
  projectId: string;
  project?: JsonObject | null;
  domainId: string;
  adminId: string;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMachineryInput {
  code: string;
  type: string;
  searchText: string;
  expectedLitrePerHour?: number | null;
  projectId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateMachineryInput {
  code?: string;
  type?: string;
  searchText?: string;
  expectedLitrePerHour?: number | null;
  projectId?: string;
  status?: StatusEnum;
}

const machinerySelect = Prisma.sql`
  "id",
  "code",
  "type",
  "expectedLitrePerHour",
  "projectId",
  "domainId",
  "adminId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

const machineryListSelect = Prisma.sql`
  m."id",
  m."code",
  m."type",
  m."expectedLitrePerHour",
  m."projectId",
  jsonb_build_object(
    'id', p."id",
    'name', p."name",
    'code', p."code"
  ) AS "project",
  m."domainId",
  m."adminId",
  m."status",
  m."isDeleted",
  m."createdAt",
  m."updatedAt"
`;

function toJsonbSql(value: MachineryType): Prisma.Sql {
  return Prisma.sql`${JSON.stringify(value)}::jsonb`;
}

export const machineryRepository = {
  create: async (data: CreateMachineryInput): Promise<MachineryRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      INSERT INTO "Machinery" (
        "id",
        "code",
        "type",
        "searchText",
        "expectedLitrePerHour",
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
        ${data.code},
        ${toJsonbSql(data.type)},
        ${data.searchText},
        ${data.expectedLitrePerHour ?? null},
        ${data.projectId},
        ${data.domainId},
        ${data.adminId},
        ${data.status},
        false,
        NOW(),
        NOW()
      )
      RETURNING ${machinerySelect}
    `);

    return result[0] as MachineryRecord;
  },

  findManyWithProjectDetails: async (
    domainId: string,
    adminId?: string,
    projectId?: string,
    searchKey?: string,
    status?: StatusEnum,
    offset = 0,
    limit = 10,
  ): Promise<MachineryRecord[]> => {
    const filters = [
      Prisma.sql`m."domainId" = ${domainId}`,
      Prisma.sql`m."isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`m."adminId" = ${adminId}`);
    }

    if (projectId) {
      filters.push(Prisma.sql`m."projectId" = ${projectId}`);
    }

    if (status) {
      filters.push(Prisma.sql`m."status" = ${status}`);
    }

    if (searchKey) {
      filters.push(
        Prisma.sql`m."searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      SELECT ${machineryListSelect}
      FROM "Machinery" m
      INNER JOIN "Project" p ON p."id" = m."projectId"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY m."createdAt" DESC
      OFFSET ${offset}
      LIMIT ${limit}
    `);
  },

  findMany: async (
    domainId: string,
    adminId?: string,
    projectId?: string,
    searchKey?: string,
    status?: StatusEnum,
  ): Promise<MachineryRecord[]> => {
    const filters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    if (projectId) {
      filters.push(Prisma.sql`"projectId" = ${projectId}`);
    }

    if (status) {
      filters.push(Prisma.sql`"status" = ${status}`);
    }

    if (searchKey) {
      filters.push(
        Prisma.sql`"searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      SELECT ${machinerySelect}
      FROM "Machinery"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY "createdAt" DESC
    `);
  },

  findManyPaginated: async (
    domainId: string,
    adminId?: string,
    projectId?: string,
    searchKey?: string,
    status?: StatusEnum,
    offset = 0,
    limit = 10,
  ): Promise<MachineryRecord[]> => {
    const filters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    if (projectId) {
      filters.push(Prisma.sql`"projectId" = ${projectId}`);
    }

    if (status) {
      filters.push(Prisma.sql`"status" = ${status}`);
    }

    if (searchKey) {
      filters.push(
        Prisma.sql`"searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      SELECT ${machinerySelect}
      FROM "Machinery"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY "createdAt" DESC
      OFFSET ${offset}
      LIMIT ${limit}
    `);
  },

  countByOptions: async (options: {
    filters: {
      domainId?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      adminId?: string;
    };
  }) => {
    const whereClause: any = {
      isDeleted: false,
      ...(options.filters && {
        ...(options.filters.domainId && { domainId: options.filters.domainId }),
        ...(options.filters.status && { status: options.filters.status }),
        ...(options.filters.searchKey && {
          searchText: { contains: options.filters.searchKey },
        }),
        ...(options.filters.adminId && { adminId: options.filters.adminId }),
      }),
    };

    return prisma.machinery.count({ where: whereClause });
  },

  count: async (
    domainId: string,
    adminId?: string,
    projectId?: string,
    searchKey?: string,
    status?: StatusEnum,
  ): Promise<number> => {
    const filters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    if (projectId) {
      filters.push(Prisma.sql`"projectId" = ${projectId}`);
    }

    if (status) {
      filters.push(Prisma.sql`"status" = ${status}`);
    }

    if (searchKey) {
      filters.push(
        Prisma.sql`"searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    const result = await prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
      SELECT COUNT(*) AS "count"
      FROM "Machinery"
      WHERE ${Prisma.join(filters, ' AND ')}
    `);

    return Number(result[0]?.count ?? 0);
  },

  findById: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<MachineryRecord | null> => {
    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      SELECT ${machinerySelect}
      FROM "Machinery"
      WHERE ${Prisma.join(filters, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateMachineryInput,
    adminId?: string,
  ): Promise<MachineryRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.code !== undefined) {
      assignments.unshift(Prisma.sql`"code" = ${data.code}`);
    }

    if (data.type !== undefined) {
      assignments.unshift(Prisma.sql`"type" = ${toJsonbSql(data.type)}`);
    }

    if (data.searchText !== undefined) {
      assignments.unshift(Prisma.sql`"searchText" = ${data.searchText}`);
    }

    if (data.expectedLitrePerHour !== undefined) {
      assignments.unshift(
        Prisma.sql`"expectedLitrePerHour" = ${data.expectedLitrePerHour}`,
      );
    }

    if (data.projectId !== undefined) {
      assignments.unshift(Prisma.sql`"projectId" = ${data.projectId}::uuid`);
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

    const result = await prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      UPDATE "Machinery"
      SET ${Prisma.join(assignments)}
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${machinerySelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<MachineryRecord | null> => {
    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      UPDATE "Machinery"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${machinerySelect}
    `);

    return result[0] ?? null;
  },

  bulkCreate(
    data: CreateMachineryInput[],
    options: { skipDuplicates?: boolean; transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.machinery.createMany({
      data: data.map((item) => ({
        code: item.code,
        type: item.type,
        searchText: item.searchText,
        expectedLitrePerHour: item.expectedLitrePerHour ?? null,
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
