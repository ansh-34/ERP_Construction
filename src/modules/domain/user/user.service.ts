import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Messages } from '../../../constants/index.js';
import {
  DomainRepository,
  TokenRepository,
  UserRepository,
} from '../../../repositories/index.js';
import { sendMail } from '../../../services/mail.services.js';
import { userInviteEmail } from '../../../templates/index.js';
import variables from '../../../config/variables.config.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const UserService = {
  async inviteUser(
    domainId: string,
    data: {
      name?: string;
      email: string;
      roleId?: string;
      skills?: string[];
      minDayCharge?: number;
    },
    baseUrl: string,
  ) {
    const { name, email, roleId, skills, minDayCharge } = data;

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
      skills: skills ?? [],
      minDayCharge: minDayCharge ?? null,
      domainId,
      adminId: domain.adminId,
      isEmailVerified: false,
    });

    await TokenRepository.create({
      token: rawToken,
      email,
      tokenPurpose: 'USER_EMAIL_VERIFICATION',
      tokenExpirationTime: tokenExpiresAt,
      domainId,
    });

    const recipientName = name?.trim() || email.split('@')[0];
    const domainDisplayName =
      typeof domain.name === 'object' && domain.name !== null
        ? (domain.name as Record<string, string>).en || 'your organization'
        : String(domain.name || 'your organization');

    const verificationLink = `${baseUrl}/verify/token?token=${rawToken}&context=user-onboarding&email=${encodeURIComponent(email)}&speciality=${domain.industry}`;
    await sendMail(
      email,
      `You're Invited to ${domainDisplayName} — Construction ERP`,
      userInviteEmail({
        recipientName,
        domainName: domainDisplayName,
        verificationLink,
      }),
    );

    return variables.NODE_ENV === 'development'
      ? { link: verificationLink }
      : { message: 'Invite sent successfully' };
  },

  async listUsers(
    domainId: string,
    query: PaginationQuery & { roleCode?: string },
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, users] = await UserRepository.listByDomain(
      domainId,
      limit,
      offset,
      query.roleCode,
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
