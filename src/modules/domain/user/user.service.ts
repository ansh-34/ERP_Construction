import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Messages } from '../../../constants/index.js';
import {
  DomainRepository,
  TokenRepository,
  UserRepository,
} from '../../../repositories/index.js';
import { sendMail } from '../../../services/mail.services.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const UserService = {
  async inviteUser(
    domainId: string,
    data: { name?: string; email: string; roleId?: string },
    baseUrl: string,
  ) {
    const { name, email, roleId } = data;

    if (!email) {
      throw new Error(Messages.USER.EMAIL_REQUIRED);
    }

    const user = await UserRepository.findActiveByEmailAndDomain(
      email,
      domainId,
    );

    if (user) {
      throw new Error(Messages.USER.ALREADY_EXISTS_IN_DOMAIN);
    }

    const domain = await DomainRepository.findActiveById(domainId);

    if (!domain) {
      throw new Error(Messages.DOMAIN.NOT_FOUND);
    }

    const temporaryPassword = await bcrypt.hash(
      crypto.randomBytes(16).toString('hex'),
      10,
    );

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

    await UserRepository.create({
      name: name?.trim() || email.split('@')[0],
      email,
      password: temporaryPassword,
      industry: domain.industry,
      roleId: roleId || null,
      domainId,
      isEmailVerified: false,
    });

    await TokenRepository.create({
      token: rawToken,
      email,
      tokenPurpose: 'USER_EMAIL_VERIFICATION',
      tokenExpirationTime: tokenExpiresAt,
      domainId,
    });

    const verificationLink = `${baseUrl}/api/user/auth/verify?token=${rawToken}&email=${encodeURIComponent(email)}`;
    await sendMail(
      email,
      'Your Verification Link',
      `<p>You have been invited to join the platform. Click the link below to verify your account:</p><p><a href="${verificationLink}">${verificationLink}</a></p><p>This link expires in 1 day.</p>`,
    );
  },

  async listUsers(domainId: string, query: PaginationQuery) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, users] = await UserRepository.listByDomain(
      domainId,
      limit,
      offset,
    );

    return {
      users,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },
};
