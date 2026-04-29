import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Messages } from '../../../constants/index.js';
import {
  DomainRepository,
  RoleRepository,
  TokenRepository,
} from '../../../repositories/index.js';
import { signToken } from '../../../services/jwt.services.js';
import { sendMail } from '../../../services/mail.services.js';

const SALT_ROUNDS = 12;

export const AuthService = {
  async login(data: { email: string; password: string }) {
    const { email, password } = data;

    if (!email || !password) {
      throw new Error(Messages.AUTH.EMAIL_PASSWORD_REQUIRED);
    }

    const domainOwner = await DomainRepository.findActiveByEmail(email);

    if (!domainOwner) {
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
      token,
      user: {
        id: domainOwner.id,
        name: domainOwner.name,
        email: domainOwner.email,
        role: adminRole?.name || 'Admin',
      },
      domain: {
        id: domainOwner.id,
        name: domainOwner.name,
      },
    };
  },
};
