import prisma from '../infra/database/prisma/prisma.client.js';

export const UserRepository = {
  findActiveByEmailAndDomain(email: string, domainId: string) {
    return prisma.user.findFirst({
      where: { email, domainId, isDeleted: false },
    });
  },

  findActiveByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, isDeleted: false },
    });
  },

  findActiveByEmailWithRoleAndDomain(email: string) {
    return prisma.user.findFirst({
      where: { email, isDeleted: false },
      include: { role: true, domain: true },
    });
  },

  findActiveByIdAndDomain(id: string, domainId: string) {
    return prisma.user.findFirst({
      where: { id, domainId, isDeleted: false },
    });
  },

  create(data: {
    name: any;
    email: string;
    password: string;
    phone?: string | null;
    phoneCode?: string | null;
    roleId?: string | null;
    domainId: string;
    isEmailVerified?: boolean;
  }) {
    return prisma.user.create({ data });
  },

  activateAndDeleteToken(userId: string, password: string, tokenId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          password,
          isEmailVerified: true,
        },
      });

      await tx.token.update({
        where: { id: tokenId },
        data: { isDeleted: true },
      });
    });
  },

  assignRole(userId: string, roleId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { roleId },
      select: {
        id: true,
        name: true,
        email: true,
        role: { select: { id: true, name: true, code: true } },
      },
    });
  },

  listByDomain(domainId: string, limit: number, offset: number) {
    return prisma.$transaction([
      prisma.user.count({ where: { domainId, isDeleted: false } }),
      prisma.user.findMany({
        where: { domainId, isDeleted: false },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          roleId: true,
          role: { select: { id: true, name: true, code: true } },
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },
};
