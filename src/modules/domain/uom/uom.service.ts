import prisma from '../../../infra/database/prisma/prisma.client.js';
import type { CreateUomDto, UpdateUomDto, ListUomsQuery } from './uom.validation.js';

export const UomService = {
  async create(domainId: string, dto: CreateUomDto) {
    const existing = await prisma.uom.findFirst({
      where: { code: dto.code, domainId, isDeleted: false },
    });
    if (existing) {
      throw new Error(`UOM with code '${dto.code}' already exists`);
    }

    return prisma.uom.create({
      data: { ...dto, domainId, isDeleted: false } as any,
    });
  },

  async findAll(domainId: string, query: ListUomsQuery) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    const skip = (page - 1) * limit;

    const where = {
      domainId,
      isDeleted: false,
      ...(query.status && { status: query.status }),
    };

    const [data, total] = await Promise.all([
      prisma.uom.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.uom.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findOne(domainId: string, id: string) {
    const record = await prisma.uom.findFirst({
      where: { id, domainId, isDeleted: false },
    });
    if (!record) throw new Error('UOM not found');
    return record;
  },

  async update(domainId: string, id: string, dto: UpdateUomDto) {
    await this.findOne(domainId, id);

    if (dto.code) {
      const conflict = await prisma.uom.findFirst({
        where: { code: dto.code, domainId, isDeleted: false, NOT: { id } },
      });
      if (conflict) {
        throw new Error(`UOM with code '${dto.code}' already exists`);
      }
    }

    return prisma.uom.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() } as any,
    });
  },

  async softDelete(domainId: string, id: string) {
    await this.findOne(domainId, id);
    return prisma.uom.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
