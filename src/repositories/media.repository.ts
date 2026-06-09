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
  adminId: string;
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
  adminId: string;
  searchText: string;
}

export interface UpdateMediaInput {
  name?: string;
  type?: string;
  searchText?: string;
}

const mediaSelect = Prisma.sql`
  "id",
  "name",
  "type",
  "url",
  "domainId",
  "adminId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

export const mediaRepository = {
  create: async (data: CreateMediaInput): Promise<MediaRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<MediaRecord[]>(Prisma.sql`
      INSERT INTO "media" ("id", "name", "type", "url", "searchText", "domainId", "adminId", "status", "isDeleted", "createdAt", "updatedAt")
      VALUES (${id}, ${data.name}, ${data.type}, ${data.url}, ${data.searchText}, ${data.domainId}, ${data.adminId}, ${StatusEnum.ACTIVE}, false, NOW(), NOW())
      RETURNING *
    `);

    return result[0] as MediaRecord;
  },

  findMany: async (
    domainId: string,
    adminId: string,
    searchKey?: string,
    type?: string,
  ): Promise<MediaRecord[]> => {
    const filters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"adminId" = ${adminId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (searchKey) {
      filters.push(
        Prisma.sql`"searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    if (type) {
      filters.push(Prisma.sql`"type" ILIKE ${`%${type}%`}`);
    }

    return prisma.$queryRaw<MediaRecord[]>(Prisma.sql`
      SELECT ${mediaSelect}
      FROM "media"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY "createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<MediaRecord | null> => {
    const result = await prisma.$queryRaw<MediaRecord[]>(Prisma.sql`
      SELECT ${mediaSelect}
      FROM "media"
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "adminId" = ${adminId} AND "isDeleted" = false
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
    adminId: string,
    data: UpdateMediaInput,
  ): Promise<MediaRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.name !== undefined) {
      assignments.unshift(Prisma.sql`"name" = ${data.name}`);
    }

    if (data.type !== undefined) {
      assignments.unshift(Prisma.sql`"type" = ${data.type}`);
    }

    if (data.searchText !== undefined) {
      assignments.unshift(Prisma.sql`"searchText" = ${data.searchText}`);
    }

    const result = await prisma.$queryRaw<MediaRecord[]>(Prisma.sql`
      UPDATE "media"
      SET ${Prisma.join(assignments)}
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "adminId" = ${adminId} AND "isDeleted" = false
      RETURNING ${mediaSelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<MediaRecord | null> => {
    const result = await prisma.$queryRaw<MediaRecord[]>(Prisma.sql`
      UPDATE "media"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "adminId" = ${adminId} AND "isDeleted" = false
      RETURNING ${mediaSelect}
    `);

    return result[0] ?? null;
  },

  bulkCreate(
    data: CreateMediaInput[],
    options: { skipDuplicates?: boolean; transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.media.createMany({
      data: data.map((item) => ({
        name: item.name,
        type: item.type,
        url: item.url,
        searchText: item.searchText,
        domainId: item.domainId,
        adminId: item.adminId,
      })),
      skipDuplicates: Object.prototype.hasOwnProperty.call(
        options,
        'skipDuplicates',
      )
        ? options.skipDuplicates
        : true,
    });
  },

  findByIdAndDomain(id: string, domainId: string) {
    return prisma.media.findFirst({
      where: { id, domainId, isDeleted: false },
    });
  },
};
