import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

export interface MachineryRecord {
  id: string;
  code: string;
  type: string;
  expectedLitrePerHour: number;
  projectId: string;
  domainId: string;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMachineryInput {
  code: string;
  type: string;
  expectedLitrePerHour: number;
  projectId: string;
  domainId: string;
  status: StatusEnum;
}

export interface UpdateMachineryInput {
  code?: string;
  type?: string;
  expectedLitrePerHour?: number;
  status?: StatusEnum;
}

const machinerySelect = Prisma.sql`
  "id",
  "code",
  "type",
  "expectedLitrePerHour",
  "projectId",
  "domainId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

export const machineryRepository = {
  create: async (data: CreateMachineryInput): Promise<MachineryRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      INSERT INTO "Machinery" (
        "id",
        "code",
        "type",
        "expectedLitrePerHour",
        "projectId",
        "domainId",
        "status",
        "isDeleted",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${id},
        ${data.code},
        ${data.type},
        ${data.expectedLitrePerHour},
        ${data.projectId},
        ${data.domainId},
        ${data.status},
        false,
        NOW(),
        NOW()
      )
      RETURNING ${machinerySelect}
    `);

    return result[0] as MachineryRecord;
  },

  findMany: async (
    domainId: string,
    projectId?: string,
  ): Promise<MachineryRecord[]> => {
    const filters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (projectId) {
      filters.push(Prisma.sql`"projectId" = ${projectId}`);
    }

    return prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      SELECT ${machinerySelect}
      FROM "Machinery"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY "createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
  ): Promise<MachineryRecord | null> => {
    const result = await prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      SELECT ${machinerySelect}
      FROM "Machinery"
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateMachineryInput,
  ): Promise<MachineryRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.code !== undefined) {
      assignments.unshift(Prisma.sql`"code" = ${data.code}`);
    }

    if (data.type !== undefined) {
      assignments.unshift(Prisma.sql`"type" = ${data.type}`);
    }

    if (data.expectedLitrePerHour !== undefined) {
      assignments.unshift(
        Prisma.sql`"expectedLitrePerHour" = ${data.expectedLitrePerHour}`,
      );
    }

    if (data.status !== undefined) {
      assignments.unshift(Prisma.sql`"status" = ${data.status}`);
    }

    const result = await prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      UPDATE "Machinery"
      SET ${Prisma.join(assignments)}
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${machinerySelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<MachineryRecord | null> => {
    const result = await prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      UPDATE "Machinery"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${machinerySelect}
    `);

    return result[0] ?? null;
  },
};
