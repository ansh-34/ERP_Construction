import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { IndustryEnum } from '../../../infra/database/prisma/generated/prisma/client/enums';
import { Messages } from '../../../constants/index';
import { DomainRepository, TokenRepository } from '../../../repositories/index';
import { sendMail } from '../../../services/mail.services';
import { domainActivationEmail } from '../../../templates/index.js';

const SALT_ROUNDS = 12;

const normalizeIndustryInput = (industry: string): IndustryEnum =>
  industry.trim().toUpperCase() as IndustryEnum;

export const DomainService = {
  async seedDomain(data: any, baseUrl: string) {
    const {
      domainName,
      email,
      password,
      industry,
      phone,
      phoneCode,
      organizationType,
    } = data;

    if (!domainName || !email || !password || !industry) {
      throw new Error(Messages.DOMAIN.NAME_EMAIL_PASSWORD_INDUSTRY_REQUIRED);
    }

    const normalizedIndustry = normalizeIndustryInput(industry);

    const existingDomain = await DomainRepository.findActiveByEmail(email);

    if (existingDomain) {
      throw new Error(Messages.DOMAIN.OWNER_EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const domainRoleId = crypto.randomUUID();
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const result = await DomainRepository.seedWithDomainRole({
      domainName,
      email,
      industry: normalizedIndustry,
      phone,
      phoneCode,
      organizationType,
      password: hashedPassword,
      token: rawToken,
      tokenExpiresAt,
      domainRoleId,
      domainPermissions: ['read', 'write', 'update', 'delete'],
    });

    const verificationLink = `${baseUrl}/api/superAdmin/domain/verify?token=${rawToken}&email=${encodeURIComponent(email)}`;
    await sendMail(
      email,
      'Activate Your Domain — Construction ERP',
      domainActivationEmail({
        domainName: typeof domainName === 'string' ? domainName : String(domainName),
        verificationLink,
      }),
    );

    return {
      domain: {
        id: result.domain.id,
        name: result.domain.name,
        email: result.domain.email,
        industry: result.domain.industry,
      },
    };
  },

  async verifyDomainToken(data: { email: string; token: string }) {
    const { email, token: rawToken } = data;

    if (!email || !rawToken) {
      throw new Error(Messages.AUTH.EMAIL_TOKEN_REQUIRED);
    }

    const tokenRecord =
      await TokenRepository.findLatestActiveByEmailTokenAndPurpose(
        email,
        rawToken,
        'DOMAIN_EMAIL_VERIFICATION',
      );

    if (!tokenRecord || new Date() > tokenRecord.tokenExpirationTime) {
      throw new Error(Messages.AUTH.INVALID_OR_EXPIRED_VERIFICATION_LINK);
    }

    const domain = await DomainRepository.findActiveByEmail(email);

    if (!domain) {
      throw new Error(Messages.DOMAIN.NOT_FOUND);
    }

    if (domain.isEmailVerified) {
      throw new Error(Messages.DOMAIN.ALREADY_VERIFIED);
    }

    await DomainRepository.verifyAndDeleteToken(domain.id, tokenRecord.id);

    return {
      domain: {
        id: domain.id,
        name: domain.name,
        email: domain.email,
        industry: domain.industry,
      },
    };
  },
};
