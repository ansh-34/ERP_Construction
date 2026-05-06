import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

export interface MediaRecord {
  id: string;
  name: string;
  type: string;
  url: string;
  domainId: string;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMediaInput {
  name: string;
  type: string;
  url: string;
  domainId: string;
}

export interface UpdateMediaInput {
  name?: string;
  type?: string;
}

const mediaSelect = Prisma.sql`
  "id",
  "name",
  "type",
  "url",
  "domainId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

export const mediaRepository = {
  create: async (data: CreateMediaInput): Promise<MediaRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<MediaRecord[]>(Prisma.sql`
      INSERT INTO "media" ("id", "name", "type", "url", "domainId", "status", "isDeleted", "createdAt", "updatedAt")
      VALUES (${id}, ${data.name}, ${data.type}, ${data.url}, ${data.domainId}, ${StatusEnum.ACTIVE}, false, NOW(), NOW())
      RETURNING *
    `);

    return result[0] as MediaRecord;
  },

  findMany: async (domainId: string): Promise<MediaRecord[]> => {
    return prisma.$queryRaw<MediaRecord[]>(Prisma.sql`
      SELECT ${mediaSelect}
      FROM "media"
      WHERE "domainId" = ${domainId} AND "isDeleted" = false
      ORDER BY "createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
  ): Promise<MediaRecord | null> => {
    const result = await prisma.$queryRaw<MediaRecord[]>(Prisma.sql`
      SELECT ${mediaSelect}
      FROM "media"
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findByUrl: async (url: string): Promise<MediaRecord | null> => {
    const result = await prisma.$queryRaw<MediaRecord[]>(Prisma.sql`
      SELECT ${mediaSelect}
      FROM "media"
      WHERE "url" = ${url} AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateMediaInput,
  ): Promise<MediaRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.name !== undefined) {
      assignments.unshift(Prisma.sql`"name" = ${data.name}`);
    }

    if (data.type !== undefined) {
      assignments.unshift(Prisma.sql`"type" = ${data.type}`);
    }

    const result = await prisma.$queryRaw<MediaRecord[]>(Prisma.sql`
      UPDATE "media"
      SET ${Prisma.join(assignments)}
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${mediaSelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<MediaRecord | null> => {
    const result = await prisma.$queryRaw<MediaRecord[]>(Prisma.sql`
      UPDATE "media"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${mediaSelect}
    `);

    return result[0] ?? null;
  },
};
