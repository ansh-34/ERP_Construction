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
    email: string;
    industry: IndustryEnum;
    password: string;
    phone?: string;
    phoneCode?: string;
    organizationType?: any;
    token: string;
    tokenExpiresAt: Date;
    domainRoleId: string;
    domainPermissions: string[];
    adminId: string;
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
        },
      });

      const admin = await tx.admin.create({
        data: {
          name: data.domainName.en,
          email: data.email,
          phone: data.phone || null,
          phoneCode: data.phoneCode || null,
          password: data.password,
          isEmailVerified: false,
          onboardingStep: 'EMAIL_VERIFICATION',
        },
      });

      await tx.domain.update({
        where: { id: domain.id },
        data: { adminId: admin.id },
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

      const domainRole = await tx.role.create({
        data: {
          id: data.domainRoleId,
          name: { en: 'domain' },
          code: 'domain',
          level: 1,
          domainId: domain.id,
        },
      });

      const modules = await tx.module.findMany({ where: { isDeleted: false } });

      if (modules.length) {
        await tx.roleModulePermission.createMany({
          data: modules.map((mod) => ({
            roleId: domainRole.id,
            moduleId: mod.id,
            permissions: data.domainPermissions,
            domainId: domain.id,
          })),
        });
      }

      return { domain: { ...domain, adminId: admin.id }, domainRole, admin };
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
};
