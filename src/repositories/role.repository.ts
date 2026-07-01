import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const RoleRepository = {
  findActiveByCodeAndDomain(code: string, domainId: string) {
    return prisma.role.findFirst({
      where: { code, domainId, isDeleted: false },
    });
  },

  count(options: {
    filters: {
      domainId?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      roleIds?: string[];
      adminId?: string;
      userTypeCode?: string;
      userTypeId?: string;
    };
  }) {
    const whereClause: any = {
      isDeleted: false,
      ...(options.filters && {
        ...(options.filters.domainId && { domainId: options.filters.domainId }),
        ...(options.filters.status && { status: options.filters.status }),
        ...(options.filters.searchKey && {
          searchText: { contains: options.filters.searchKey },
        }),
        ...(options.filters.roleIds && { id: { in: options.filters.roleIds } }),
        ...(options.filters.adminId && { adminId: options.filters.adminId }),
        ...(options.filters.userTypeCode && {
          userTypeCode: options.filters.userTypeCode,
        }),
        ...(options.filters.userTypeId && {
          userTypeId: options.filters.userTypeId,
        }),
      }),
    };

    return prisma.role.count({ where: whereClause });
  },

  findActiveByIdAndDomain(id: string, domainId: string) {
    return prisma.role.findFirst({
      where: { id, domainId, isDeleted: false },
      include: {
        roleModulePermissions: {
          include: {
            module: {
              select: {
                id: true,
                name: true,
                code: true,
                status: true,
              },
            },
          },
        },
        userType: true,
      },
    });
  },

  findDomainRoleByDomain(domainId: string) {
    return prisma.role.findFirst({
      where: { domainId, code: 'domain', isDeleted: false },
    });
  },

  findActiveByDomain(domainId: string, select?: any): Promise<any> {
    return prisma.role.findMany({
      where: { domainId, isDeleted: false },
      select,
      orderBy: { createdAt: 'desc' },
    }) as Promise<any>;
  },

  findDuplicateCode(domainId: string, code: string, excludeId: string) {
    return prisma.role.findFirst({
      where: { domainId, code, isDeleted: false, NOT: { id: excludeId } },
    });
  },

  create(data: Prisma.RoleUncheckedCreateInput) {
    return prisma.role.create({ data });
  },

  listByDomain(
    domainId: string,
    limit: number,
    offset: number,
    filter?: {
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      userTypeCode?: string;
      userTypeId?: string;
      domainUserTypeCode?: string;
      standalone?: boolean;
    },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.RoleWhereInput = {
      domainId,
      isDeleted: false,
      ...(filter?.status && { status: filter.status }),
      ...(filter?.userTypeCode && { userTypeCode: filter.userTypeCode }),
      ...(filter?.userTypeId && { userTypeId: filter.userTypeId }),
      ...(filter?.domainUserTypeCode && {
        domainUserTypeCode: filter.domainUserTypeCode,
      }),
      ...(filter?.standalone === true && { domainUserTypeCode: null }),
      ...(searchKey && {
        searchText: { contains: searchKey, mode: 'insensitive' as const },
      }),
    };

    return prisma.$transaction([
      prisma.role.count({ where }),
      prisma.role.findMany({
        where,
        include: {
          roleModulePermissions: {
            include: { module: { select: { name: true, code: true } } },
          },
          userType: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  update(id: string, data: Prisma.RoleUncheckedUpdateInput, tx?: any) {
    const client = tx || prisma;
    return client.role.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.role.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },
};
