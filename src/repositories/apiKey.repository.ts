import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

export interface ApiKeyRecord {
  id: string;
  name: string;
  description: string;
  secret: string;
  domainId: string;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ApiKeyPublicRecord = Omit<ApiKeyRecord, 'secret'>;

export interface CreateApiKeyInput {
  name: string;
  description: string;
  domainId: string;
  secret: string;
}

export interface UpdateApiKeyInput {
  name?: string;
  description?: string;
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

export const apiKeyRepository = {
  create: async (data: CreateApiKeyInput): Promise<ApiKeyRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<ApiKeyRecord[]>(Prisma.sql`
      INSERT INTO "ApiKey" ("id", "name", "description", "secret", "domainId", "status", "isDeleted", "createdAt", "updatedAt")
      VALUES (${id}, ${data.name}, ${data.description}, ${data.secret}, ${data.domainId}, ${StatusEnum.ACTIVE}, false, NOW(), NOW())
      RETURNING *
    `);

    return result[0] as ApiKeyRecord;
  },

  findMany: async (domainId: string): Promise<ApiKeyPublicRecord[]> => {
    return prisma.$queryRaw<ApiKeyPublicRecord[]>(Prisma.sql`
      SELECT ${apiKeySelect}
      FROM "ApiKey"
      WHERE "domainId" = ${domainId} AND "isDeleted" = false
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
      assignments.unshift(Prisma.sql`"name" = ${data.name}`);
    }

    if (data.description !== undefined) {
      assignments.unshift(Prisma.sql`"description" = ${data.description}`);
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
};
