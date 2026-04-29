import prisma from '../infra/database/prisma/prisma.client.js';

export const DomainRepository = {
  findActiveById(id: string) {
    return prisma.domain.findFirst({ where: { id, isDeleted: false } });
  },

  findActiveByEmail(email: string) {
    return prisma.domain.findFirst({ where: { email, isDeleted: false } });
  },

  seedWithAdmin(data: {
    domainName: string;
    email: string;
    password: string;
    phone?: string;
    phoneCode?: string;
    organizationType?: any;
    token: string;
    tokenExpiresAt: Date;
    adminRoleId: string;
    adminPermissions: string[];
  }) {
    return prisma.$transaction(async (tx) => {
      const domain = await tx.domain.create({
        data: {
          name: { en: data.domainName },
          email: data.email,
          phone: data.phone || null,
          phoneCode: data.phoneCode || null,
          organizationType: data.organizationType || null,
          password: data.password,
          isEmailVerified: false,
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

      const adminRole = await tx.role.create({
        data: {
          id: data.adminRoleId,
          name: { en: 'Admin' },
          code: 'admin',
          level: 0,
          domainId: domain.id,
        },
      });

      const modules = await tx.module.findMany({ where: { isDeleted: false } });

      if (modules.length) {
        await tx.roleModulePermission.createMany({
          data: modules.map((mod) => ({
            roleId: adminRole.id,
            moduleId: mod.id,
            permissions: data.adminPermissions,
            domainId: domain.id,
          })),
        });
      }

      return { domain, adminRole };
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
};
