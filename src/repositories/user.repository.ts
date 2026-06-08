import prisma from '../infra/database/prisma/prisma.client.js';
import type { IndustryEnum } from '../infra/database/prisma/generated/prisma/client/enums.js';
import { StatusEnum } from '@constants/index';

export const UserRepository = {
  findActiveByEmailAndDomain(email: string, domainId: string) {
    return prisma.user.findFirst({
      where: { email, domainId, isDeleted: false },
    });
  },

  countByRole(roleId: string, domainId: string) {
    return prisma.user.count({
      where: { roleId, domainId, isDeleted: false },
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

  findActiveByIdentifierWithRoleAndDomain(identifier: string) {
    return prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
        isDeleted: false,
      },
      include: { role: true, domain: true },
    });
  },

  findActiveByIdAndDomain(id: string, domainId: string) {
    return prisma.user.findFirst({
      where: { id, domainId, isDeleted: false },
    });
  },

  findActiveByIdAndDomainWithRelations(
    id: string,
    domainId: string,
    select?: any,
  ): Promise<any> {
    return prisma.user.findFirst({
      where: { id, domainId, isDeleted: false },
      select,
    }) as Promise<any>;
  },

  validateUserIds(ids: string[], domainId: string) {
    return prisma.user
      .count({
        where: { id: { in: ids }, domainId, isDeleted: false },
      })
      .then((count) => count === ids.length);
  },

  findActiveByIdWithRoleAndDomain(id: string) {
    return prisma.user.findFirst({
      where: { id, isDeleted: false },
      include: { role: true, domain: true },
    });
  },

  create(data: {
    name: string;
    email: string;
    password: string;
    industry: IndustryEnum;
    phone?: string | null;
    phoneCode?: string | null;
    roleId?: string | null;
    skills?: string[];
    minDayCharge?: number | null;
    domainId: string;
    adminId?: string | null;
    isEmailVerified?: boolean;
  }) {
    return prisma.user.create({
      data: {
        ...data,
        status: StatusEnum.ACTIVE,
      },
    });
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

  assignRole(userIds: string[], roleId: string) {
    return prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: { roleId },
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
          industry: true,
          skills: true,
          minDayCharge: true,
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

  updatePassword(id: string, password: string) {
    return prisma.user.update({
      where: { id },
      data: { password },
    });
  },
};
