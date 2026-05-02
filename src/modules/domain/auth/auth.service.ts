import bcrypt from 'bcrypt';
import type { IndustryEnum } from '../../../infra/database/prisma/generated/prisma/client/enums.js';
import { Messages } from '../../../constants/index.js';
import {
  DomainRepository,
  RoleRepository,
} from '../../../repositories/index.js';
import { signToken } from '../../../services/jwt.services.js';

export const AuthService = {
  async login(data: {
    identifier: string;
    password: string;
    speciality: IndustryEnum;
  }) {
    const { speciality, identifier, password } = data;

    if (!identifier || !password || !speciality) {
      throw new Error(Messages.AUTH.DOMAIN_LOGIN_REQUIRED);
    }

    const domainOwner = await DomainRepository.findActiveByEmail(identifier);
    if (!domainOwner) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    if (!domainOwner.industry.includes(speciality)) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const passwordMatch = await bcrypt.compare(password, domainOwner.password);
    if (!passwordMatch) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const adminRole = await RoleRepository.findAdminByDomain(domainOwner.id);

    const token = signToken({
      userId: domainOwner.id,
      domainId: domainOwner.id,
      roleId: adminRole?.id || '',
    });

    return {
      accessToken: token,
      refreshToken: token,
      user: {
        id: domainOwner.id,
        name: domainOwner.name,
        email: domainOwner.email,
        role: adminRole?.name || 'Admin',
      },
      domain: {
        id: domainOwner.id,
        name: domainOwner.name,
        industry: domainOwner.industry,
      },
    };
  },
};
