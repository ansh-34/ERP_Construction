import jwt from 'jsonwebtoken';
import prisma from '../../infra/database/prisma/prisma.client.js';

type ProfileTokenPayload = jwt.JwtPayload & {
  userId?: string;
  domainId?: string;
  roleId?: string | null;
  industry?: string;
  id?: string;
  email?: string;
};

const roleSelect = {
  id: true,
  name: true,
  code: true,
  level: true,
  domainId: true,
  status: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
};

const domainSelect = {
  id: true,
  name: true,
  email: true,
  organizationType: true,
  phoneCode: true,
  phone: true,
  mediaId: true,
  industry: true,
  isEmailVerified: true,
  status: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  phoneCode: true,
  phone: true,
  industry: true,
  roleId: true,
  mediaId: true,
  isEmailVerified: true,
  domainId: true,
  status: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  role: { select: roleSelect },
  domain: { select: domainSelect },
};

const superAdminSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
};

const getStringName = (name: unknown): string => {
  if (typeof name === 'string') return name;

  if (name && typeof name === 'object') {
    const values = Object.values(name as Record<string, unknown>);
    const englishName = (name as Record<string, unknown>).en;

    if (typeof englishName === 'string') return englishName;

    const firstStringValue = values.find(
      (value): value is string => typeof value === 'string',
    );

    if (firstStringValue) return firstStringValue;
  }

  return '';
};

const formatRole = <T extends { name: string; code: string | null }>(
  role: T,
) => ({
  ...role,
  name: role.name.toUpperCase(),
  code: role.code?.toLowerCase() || null,
});

export const ProfileService = {
  async getProfile(token: string) {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as ProfileTokenPayload;

    if (decoded.userId && decoded.domainId) {
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          domainId: decoded.domainId,
          isDeleted: false,
        },
        select: userSelect,
      });

      if (user) {
        const { domain, role, ...userProfile } = user;
        const userRole = {
          id: user.roleId || '3',
          name: 'USER',
          code: 'user',
          level: 3,
          domainId: user.domainId,
          status: role?.status || 'active',
          isDeleted: false,
          createdAt: role?.createdAt || user.createdAt,
          updatedAt: role?.updatedAt || user.updatedAt,
        };

        return {
          user: {
            ...userProfile,
            role: 'USER',
          },
          domain: {
            ...domain,
            name: getStringName(domain.name),
          },
          roles: [userRole],
        };
      }

      const domain = await prisma.domain.findFirst({
        where: {
          id: decoded.domainId,
          isDeleted: false,
        },
        select: domainSelect,
      });

      if (domain) {
        const roles = await prisma.role.findMany({
          where: { domainId: domain.id, isDeleted: false },
          select: roleSelect,
          orderBy: { createdAt: 'desc' },
        });
        const domainRole = roles.find((role) => role.code === 'domain');
        const formattedRoles = roles.map(formatRole);

        return {
          user: {
            id: domain.id,
            name: getStringName(domain.name),
            email: domain.email,
            phoneCode: domain.phoneCode,
            phone: domain.phone,
            industry: domain.industry,
            roleId: domainRole?.id || decoded.roleId || null,
            role: (domainRole?.code || 'domain').toUpperCase(),
            isEmailVerified: domain.isEmailVerified,
            status: domain.status,
            isDeleted: domain.isDeleted,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
          },
          domain: {
            ...domain,
            name: getStringName(domain.name),
          },
          roles: formattedRoles,
        };
      }
    }

    if (decoded.id && decoded.email) {
      const superdomain = await prisma.superAdmin.findFirst({
        where: {
          id: decoded.id,
          email: decoded.email,
          isDeleted: false,
        },
        select: superAdminSelect,
      });

      if (superdomain) {
        return {
          user: {
            id: superdomain.id,
            name: 'Superadmin',
            email: superdomain.email,
            role: 'SUPERADMIN',
          },
        };
      }
    }

    throw new Error('Profile not found');
  },
};
