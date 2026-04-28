import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';

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
  parentLocationId?: string | null;
  domainId: string;
  status: StatusEnum;
}

export interface UpdateLocationInput {
  name?: JsonObject;
  type?: string;
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
    const result = await prisma.$queryRaw<LocationRecord[]>(Prisma.sql`
      INSERT INTO "Location" ("name", "code", "type", "parentLocationId", "domainId", "status", "isDeleted", "createdAt", "updatedAt")
      VALUES (${JSON.stringify(data.name)}::jsonb, ${data.code}, ${data.type}, ${data.parentLocationId ?? null}, ${data.domainId}, ${data.status}, false, NOW(), NOW())
      RETURNING *
    `);

    return result[0] as LocationRecord;
  },

  findMany: async (domainId: string): Promise<LocationRecord[]> => {
    return prisma.$queryRaw<LocationRecord[]>(Prisma.sql`
      SELECT ${locationSelect}
      FROM "Location"
      WHERE "domainId" = ${domainId} AND "isDeleted" = false
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

    if (data.type !== undefined) {
      assignments.unshift(Prisma.sql`"type" = ${data.type}`);
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
};
