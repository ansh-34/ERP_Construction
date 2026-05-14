import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type JsonObject = Record<string, unknown>;

export interface LocationRecord {
  id: string;
  name: JsonObject;
  code: string;
  type: string;
  parentLocationId: string | null;
  domainId: string;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLocationInput {
  name: JsonObject;
  code: string;
  type: string;
  searchText: string;
  parentLocationId?: string | null;
  domainId: string;
  status: StatusEnum;
}

export interface UpdateLocationInput {
  name?: JsonObject;
  code?: string;
  type?: string;
  searchText?: string;
  parentLocationId?: string | null;
  status?: StatusEnum;
}

const locationSelect = Prisma.sql`
  "id",
  "name",
  "code",
  "type",
  "parentLocationId",
  "domainId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

export const locationRepository = {
  create: async (data: CreateLocationInput): Promise<LocationRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<LocationRecord[]>(Prisma.sql`
      INSERT INTO "Location" ("id", "name", "code", "type", "searchText", "parentLocationId", "domainId", "status", "isDeleted", "createdAt", "updatedAt")
      VALUES (${id}, ${JSON.stringify(data.name)}::jsonb, ${data.code}, ${data.type}, ${data.searchText}, ${data.parentLocationId ?? null}, ${data.domainId}, ${data.status}, false, NOW(), NOW())
      RETURNING *
    `);

    return result[0] as LocationRecord;
  },

  findMany: async (
    domainId: string,
    searchKey?: string,
  ): Promise<LocationRecord[]> => {
    const filters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (searchKey) {
      filters.push(
        Prisma.sql`"searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<LocationRecord[]>(Prisma.sql`
      SELECT ${locationSelect}
      FROM "Location"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY "createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
  ): Promise<LocationRecord | null> => {
    const result = await prisma.$queryRaw<LocationRecord[]>(Prisma.sql`
      SELECT ${locationSelect}
      FROM "Location"
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findByCode: async (
    code: string,
    domainId: string,
  ): Promise<LocationRecord | null> => {
    const result = await prisma.$queryRaw<LocationRecord[]>(Prisma.sql`
      SELECT ${locationSelect}
      FROM "Location"
      WHERE "code" = ${code} AND "domainId" = ${domainId} AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateLocationInput,
  ): Promise<LocationRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.name !== undefined) {
      assignments.unshift(
        Prisma.sql`"name" = ${JSON.stringify(data.name)}::jsonb`,
      );
    }

    if (data.code !== undefined) {
      assignments.unshift(Prisma.sql`"code" = ${data.code}`);
    }

    if (data.type !== undefined) {
      assignments.unshift(Prisma.sql`"type" = ${data.type}`);
    }

    if (data.searchText !== undefined) {
      assignments.unshift(Prisma.sql`"searchText" = ${data.searchText}`);
    }

    if (data.parentLocationId !== undefined) {
      assignments.unshift(
        Prisma.sql`"parentLocationId" = ${data.parentLocationId}`,
      );
    }

    if (data.status !== undefined) {
      assignments.unshift(Prisma.sql`"status" = ${data.status}`);
    }

    const result = await prisma.$queryRaw<LocationRecord[]>(Prisma.sql`
      UPDATE "Location"
      SET ${Prisma.join(assignments)}
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${locationSelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<LocationRecord | null> => {
    const result = await prisma.$queryRaw<LocationRecord[]>(Prisma.sql`
      UPDATE "Location"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${locationSelect}
    `);

    return result[0] ?? null;
  },

  bulkCreate(
    data: CreateLocationInput[],
    options: { skipDuplicates?: boolean; transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.location.createMany({
      data: data.map((item) => ({
        name: item.name,
        code: item.code,
        type: item.type,
        searchText: item.searchText,
        parentLocationId: item.parentLocationId || null,
        domainId: item.domainId,
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
