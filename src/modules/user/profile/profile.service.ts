import { UserRepository } from '../../../repositories/index.js';

const roleSelect = {
  id: true,
  name: true,
  code: true,
  level: true,
  domainId: true,
  domainUserTypeCode: true,
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

export const UserProfileService = {
  async getProfile(userId: string, domainId: string) {
    const user = await UserRepository.findActiveByIdAndDomainWithRelations(
      userId,
      domainId,
      userSelect,
    );

    if (!user) {
      throw new Error('User profile not found');
    }

    const { domain, role, ...userProfile } = user;
    const userRole = {
      id: user.roleId || '3',
      name: 'USER',
      code: 'user',
      level: 3,
      domainId: user.domainId,
      domainUserTypeCode: (role as any)?.domainUserTypeCode ?? null,
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
  },
};
