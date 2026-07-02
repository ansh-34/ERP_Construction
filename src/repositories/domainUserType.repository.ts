import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '@/infra/database/prisma/prisma.client';

const withUserType = {
  userType: true,
} satisfies Prisma.DomainUserTypeInclude;

export const domainUserTypeRepository = {
  findDuplicate(domainId: string, userTypeId: string) {
    return prisma.domainUserType.findFirst({
      where: { domainId, userTypeId, isDeleted: false },
    });
  },

  // Map one or more global UserTypes into this domain in a single transaction.
  mapMany(domainId: string, adminId: string, userTypeIds: string[]) {
    return prisma.$transaction(
      userTypeIds.map((userTypeId) =>
        prisma.domainUserType.create({
          data: { domainId, adminId, userTypeId },
          include: withUserType,
        }),
      ),
    );
  },

  findByIdAndDomain(id: string, domainId: string) {
    return prisma.domainUserType.findFirst({
      where: { id, domainId, isDeleted: false },
      include: withUserType,
    });
  },

  findByCodeAndDomain(code: string, domainId: string) {
    return prisma.domainUserType.findFirst({
      where: {
        domainId,
        isDeleted: false,
        userType: { code, isDeleted: false },
      },
      include: withUserType,
    });
  },

  // IDs of UserTypes already mapped (active) for this domain.
  findMappedUserTypeIds(domainId: string) {
    return prisma.domainUserType.findMany({
      where: { domainId, isDeleted: false },
      select: { userTypeId: true },
    });
  },

  listByDomain(
    domainId: string,
    limit: number,
    offset: number,
    filter?: { searchKey?: string },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.DomainUserTypeWhereInput = {
      domainId,
      isDeleted: false,
      ...(searchKey
        ? {
            userType: {
              OR: [
                { code: { contains: searchKey, mode: 'insensitive' } },
                {
                  name: {
                    path: ['en'],
                    string_contains: searchKey,
                  },
                },
              ],
            },
          }
        : {}),
    };

    return prisma.$transaction([
      prisma.domainUserType.count({ where }),
      prisma.domainUserType.findMany({
        where,
        include: withUserType,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  softDelete(id: string) {
    return prisma.domainUserType.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
