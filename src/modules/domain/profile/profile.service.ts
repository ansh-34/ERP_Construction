import prisma from '../../../infra/database/prisma/prisma.client.js';

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

const formatRole = <T extends { name: unknown; code: string | null }>(
  role: T,
) => ({
  ...role,
  name: getStringName(role.name).toUpperCase(),
  code: role.code?.toLowerCase() || null,
});

export const DomainProfileService = {
  async getProfile(domainId: string) {
    const domain = await prisma.domain.findFirst({
      where: {
        id: domainId,
        isDeleted: false,
      },
      select: domainSelect,
    });

    if (!domain) {
      throw new Error('Domain profile not found');
    }

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
        roleId: domainRole?.id || null,
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
  },
};
