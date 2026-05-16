import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { IndustryEnum } from '../../../infra/database/prisma/generated/prisma/client/enums';
import { Messages } from '../../../constants/index';
import {
  DomainRepository,
  TokenRepository,
  AdminRepository,
} from '../../../repositories/index.js';
import { sendMail } from '../../../services/mail.services';
import { domainActivationEmail } from '../../../templates/index.js';
import variables from '../../../config/variables.config.js';

const SALT_ROUNDS = 12;

const normalizeIndustryInput = (industry: string): IndustryEnum =>
  industry.trim().toUpperCase() as IndustryEnum;

export const DomainService = {
  async seedDomain(
    data: any,
    adminId: string,
    baseUrl: string,
    langCode: string = 'en',
  ) {
    const {
      domainName,
      email,
      password,
      industry,
      phone,
      phoneCode,
      organizationType,
    } = data;

    if (!domainName || !email || !password || !industry || !adminId) {
      throw new Error(Messages.DOMAIN.NAME_EMAIL_PASSWORD_INDUSTRY_REQUIRED);
    }

    const incomingLanguageCodes: string[] = Object.keys(domainName || {});
    if (!incomingLanguageCodes.includes('en')) {
      throw new Error(Messages.DOMAIN.NAME_EN_CODE_REQUIRED);
    }

    const normalizedIndustry = normalizeIndustryInput(industry);

    const existingDomain = await DomainRepository.findActiveByEmail(email);

    if (existingDomain) {
      throw new Error(Messages.DOMAIN.OWNER_EMAIL_ALREADY_EXISTS);
    }

    const admin = await AdminRepository.findActiveById(adminId);
    if (!admin) {
      throw new Error('Assigned Admin not found');
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
      adminId,
    });

    const verificationLink = `${baseUrl}/verify/token?token=${rawToken}&context=domain-onboarding&email=${encodeURIComponent(email)}&speciality=${normalizedIndustry}`;
    await sendMail(
      email,
      'Activate Your Domain — Construction ERP',
      domainActivationEmail({
        domainName: domainName[langCode] || domainName.en || String(domainName),
        verificationLink,
      }),
    );

    return {
      domain: {
        id: result.domain.id,
        name:
          (result.domain.name as any)[langCode] ||
          (result.domain.name as any)?.en ||
          '',
        email: result.domain.email,
        industry: result.domain.industry,
      },
      ...(variables.NODE_ENV === 'development' ? { link: verificationLink } : {}),
    };
  },

  async verifyDomainToken(
    data: { email: string; token: string },
    langCode: string = 'en',
  ) {
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
        name: (domain.name as any)[langCode] || (domain.name as any)?.en || '',
        email: domain.email,
        industry: domain.industry,
      },
    };
  },

  async listDomains(adminId: string, limit: number, offset: number, searchKey?: string) {
    const [totalCount, domains] = await DomainRepository.listByAdmin(adminId, limit, offset, searchKey);
    return {
      totalCount,
      domains,
    };
  },

  async getDomainById(adminId: string, domainId: string) {
    const domain = await DomainRepository.findByIdAndAdmin(domainId, adminId);
    if (!domain) {
      throw new Error(Messages.DOMAIN.NOT_FOUND);
    }
    return domain;
  },

  async updateDomain(adminId: string, domainId: string, data: any) {
    const domain = await DomainRepository.findByIdAndAdmin(domainId, adminId);
    if (!domain) {
      throw new Error(Messages.DOMAIN.NOT_FOUND);
    }
  
    const updateData = { ...data };
    delete updateData.email; 
    delete updateData.password;

    return DomainRepository.update(domainId, updateData);
  },

  async deleteDomain(adminId: string, domainId: string) {
    const domain = await DomainRepository.findByIdAndAdmin(domainId, adminId);
    if (!domain) {
      throw new Error(Messages.DOMAIN.NOT_FOUND);
    }
    return DomainRepository.softDelete(domainId);
  },
};
