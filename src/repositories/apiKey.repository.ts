import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type JsonObject = Record<string, unknown>;

export interface ApiKeyRecord {
  id: string;
  name: JsonObject;
  description: JsonObject | null;
  secret: string;
  domainId: string;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ApiKeyPublicRecord = Omit<ApiKeyRecord, 'secret'>;

export interface CreateApiKeyInput {
  name: JsonObject;
  description: JsonObject;
  domainId: string;
  secret: string;
  searchText: string;
}

export interface UpdateApiKeyInput {
  name?: JsonObject;
  description?: JsonObject;
  searchText?: string;
}

const apiKeySelect = Prisma.sql`
  "id",
  "name",
  "description",
  "domainId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

function toJsonbSql(value: JsonObject): Prisma.Sql {
  return Prisma.sql`${JSON.stringify(value)}::jsonb`;
}

export const apiKeyRepository = {
  create: async (data: CreateApiKeyInput): Promise<ApiKeyRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<ApiKeyRecord[]>(Prisma.sql`
      INSERT INTO "ApiKey" ("id", "name", "description", "secret", "searchText", "domainId", "status", "isDeleted", "createdAt", "updatedAt")
      VALUES (${id}, ${toJsonbSql(data.name)}, ${toJsonbSql(data.description)}, ${data.secret}, ${data.searchText}, ${data.domainId}, ${StatusEnum.ACTIVE}, false, NOW(), NOW())
      RETURNING *
    `);

    return result[0] as ApiKeyRecord;
  },

  findMany: async (
    domainId: string,
    searchKey?: string,
  ): Promise<ApiKeyPublicRecord[]> => {
    const filters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (searchKey) {
      filters.push(
        Prisma.sql`"searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<ApiKeyPublicRecord[]>(Prisma.sql`
      SELECT ${apiKeySelect}
      FROM "ApiKey"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY "createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
  ): Promise<ApiKeyPublicRecord | null> => {
    const result = await prisma.$queryRaw<ApiKeyPublicRecord[]>(Prisma.sql`
      SELECT ${apiKeySelect}
      FROM "ApiKey"
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateApiKeyInput,
  ): Promise<ApiKeyPublicRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.name !== undefined) {
      assignments.unshift(Prisma.sql`"name" = ${toJsonbSql(data.name)}`);
    }

    if (data.description !== undefined) {
      assignments.unshift(
        Prisma.sql`"description" = ${toJsonbSql(data.description)}`,
      );
    }

    if (data.searchText !== undefined) {
      assignments.unshift(Prisma.sql`"searchText" = ${data.searchText}`);
    }

    const result = await prisma.$queryRaw<ApiKeyPublicRecord[]>(Prisma.sql`
      UPDATE "ApiKey"
      SET ${Prisma.join(assignments)}
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${apiKeySelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<ApiKeyPublicRecord | null> => {
    const result = await prisma.$queryRaw<ApiKeyPublicRecord[]>(Prisma.sql`
      UPDATE "ApiKey"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${apiKeySelect}
    `);

    return result[0] ?? null;
  },

  bulkCreate(
    data: CreateApiKeyInput[],
    options: { skipDuplicates?: boolean; transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.apiKey.createMany({
      data: data.map((item) => ({
        name: item.name,
        description: item.description,
        secret: item.secret,
        searchText: item.searchText,
        domainId: item.domainId,
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
