import { Messages } from '../../../constants/index';
import {
  DomainRepository,
  TokenRepository,
} from '../../../repositories/index.js';
import { seedDefaultRolesForDomain } from '@/seed/role';

export const OnboardingService = {
  async domainOnboarding(domainId: string, adminId: string) {
    return await Promise.all([
      seedDefaultRolesForDomain(domainId, adminId),
      DomainRepository.update(domainId, { onboardingStatus: 'COMPLETED' }),
    ]);
  },

  async verifyTokenAndOnboard(
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

    await Promise.all([
      DomainRepository.verifyAndDeleteToken(domain.id, tokenRecord.id),
      DomainRepository.update(domain.id, {
        onboardingStep: 'DEFAULT_ROLE_CREATION',
        onboardingStatus: 'INPROGRESS',
      }),
    ]);

    await this.domainOnboarding(domain.id, domain.adminId);

    return {
      domain: {
        id: domain.id,
        name: (domain.name as any)[langCode] || (domain.name as any)?.en || '',
        email: domain.email,
        industry: domain.industry,
      },
    };
  },
};
