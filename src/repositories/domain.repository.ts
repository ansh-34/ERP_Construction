import prisma from '../infra/database/prisma/prisma.client.js';
import type { IndustryEnum } from '../infra/database/prisma/generated/prisma/client/enums.js';

export const DomainRepository = {
  findActiveById(id: string) {
    return prisma.domain.findFirst({ where: { id, isDeleted: false } });
  },

  findActiveByEmail(email: string) {
    return prisma.domain.findFirst({ where: { email, isDeleted: false } });
  },

  seedWithDomainRole(data: {
    domainName: Record<string, string>;
    nameSearchText: string;
    organizationTypeSearchText: string;
    email: string;
    industry: IndustryEnum;
    password: string;
    phone?: string;
    phoneCode?: string;
    organizationType?: any;
    token: string;
    tokenExpiresAt: Date;
    adminId: string;
    onboardingStep: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const domain = await tx.domain.create({
        data: {
          name: data.domainName,
          email: data.email,
          phone: data.phone || null,
          phoneCode: data.phoneCode || null,
          organizationType: data.organizationType || null,
          industry: data.industry,
          password: data.password,
          isEmailVerified: false,
          adminId: data.adminId,
          nameSearchText: data.nameSearchText,
          organizationTypeSearchText: data.organizationTypeSearchText,
          onboardingStep: data.onboardingStep,
        },
      });

      await tx.token.create({
        data: {
          token: data.token,
          email: data.email,
          tokenPurpose: 'DOMAIN_EMAIL_VERIFICATION',
          tokenExpirationTime: data.tokenExpiresAt,
          domainId: domain.id,
        },
      });

      return { domain };
    });
  },

  verifyAndDeleteToken(domainId: string, tokenId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.domain.update({
        where: { id: domainId },
        data: { isEmailVerified: true },
      });

      await tx.token.update({
        where: { id: tokenId },
        data: { isDeleted: true },
      });
    });
  },

  updatePassword(id: string, password: string) {
    return prisma.domain.update({
      where: { id },
      data: { password },
    });
  },

  listByAdmin(
    adminId: string,
    limit: number,
    offset: number,
    searchKey?: string,
  ) {
    const where: any = {
      adminId,
      isDeleted: false,
    };

    if (searchKey) {
      where.email = { contains: searchKey, mode: 'insensitive' };
    }

    return prisma.$transaction([
      prisma.domain.count({ where }),
      prisma.domain.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
  },

  findByIdAndAdmin(id: string, adminId: string) {
    return prisma.domain.findFirst({
      where: { id, adminId, isDeleted: false },
    });
  },

  update(id: string, data: any) {
    return prisma.domain.update({
      where: { id },
      data,
    });
  },

  softDelete(id: string) {
    return prisma.domain.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
