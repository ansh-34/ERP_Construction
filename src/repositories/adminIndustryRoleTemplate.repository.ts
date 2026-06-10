import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';
import type { IndustryEnum } from '../infra/database/prisma/generated/prisma/client/enums.js';

export const AdminIndustryRoleTemplateRepository = {
  findDuplicate(
    adminId: string,
    industry: IndustryEnum,
    code: string,
    excludeId?: string,
  ) {
    return prisma.adminIndustryRoleTemplate.findFirst({
      where: {
        adminId,
        industry,
        code,
        isDeleted: false,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  },

  create(data: Prisma.AdminIndustryRoleTemplateUncheckedCreateInput) {
    return prisma.adminIndustryRoleTemplate.create({ data });
  },

  listByAdmin(
    adminId: string,
    limit: number,
    offset: number,
    filter?: {
      industry?: IndustryEnum;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
    },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.AdminIndustryRoleTemplateWhereInput = {
      adminId,
      isDeleted: false,
      ...(filter?.industry && { industry: filter.industry }),
      ...(filter?.status && { status: filter.status }),
      ...(searchKey && {
        searchText: { contains: searchKey, mode: 'insensitive' },
      }),
    };

    return prisma.$transaction([
      prisma.adminIndustryRoleTemplate.count({ where }),
      prisma.adminIndustryRoleTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  listActiveByAdminAndIndustry(adminId: string, industry: IndustryEnum) {
    return prisma.adminIndustryRoleTemplate.findMany({
      where: {
        adminId,
        industry,
        status: 'ACTIVE',
        isDeleted: false,
      },
      orderBy: [{ level: 'asc' }, { createdAt: 'desc' }],
    });
  },

  findByIdAndAdmin(id: string, adminId: string) {
    return prisma.adminIndustryRoleTemplate.findFirst({
      where: { id, adminId, isDeleted: false },
    });
  },

  update(
    id: string,
    data: Prisma.AdminIndustryRoleTemplateUncheckedUpdateInput,
  ) {
    return prisma.adminIndustryRoleTemplate.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.adminIndustryRoleTemplate.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },
};
