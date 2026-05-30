import { verifyOtp } from '@/services/otp.service';
import { Messages } from '../../../constants/index';
import {
  AdminRepository,
  DomainRepository,
  OtpRepository,
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

  async handleOtpVerification(otp: string, domainId: string, adminId: string) {
    const [admin, domain] = await Promise.all([
      AdminRepository.findActiveById(adminId),
      DomainRepository.findActiveById(domainId),
    ]);
    if (!admin) {
      throw new Error(Messages.ADMIN.NOT_FOUND);
    }
    if (!domain) {
      throw new Error(Messages.DOMAIN.NOT_FOUND);
    }

    const otpRecord = await OtpRepository.findLatestActive(domain.email);
    if (!otpRecord) {
      throw new Error(Messages.PASSWORD_RESET.OTP_INVALID);
    }

    if (new Date() > otpRecord.expiresAt) {
      await OtpRepository.markUsed(otpRecord.id);
      throw new Error(Messages.PASSWORD_RESET.OTP_EXPIRED);
    }

    const isValid = await verifyOtp(otp, otpRecord.otp);
    if (!isValid) {
      throw new Error(Messages.PASSWORD_RESET.OTP_INVALID);
    }

    await Promise.all([
      OtpRepository.markUsed(otpRecord.id),
      DomainRepository.update(domain.id, {
        onboardingStatus: 'INPROGRESS',
        onboardingStep: 'DEFAULT_ROLE_CREATION',
        isEmailVerified: true,
      }),
    ]);

    return true;
  },

  async onboardDomain(
    data: { otp?: string },
    step: 'EMAIL_VERIFICATION',
    domainId: string,
    adminId: string,
  ) {
    switch (step) {
      case 'EMAIL_VERIFICATION':
        await this.handleOtpVerification(data.otp!, domainId, adminId);
        await this.domainOnboarding(domainId, adminId);
        break;
      default:
        throw new Error(Messages.ONBOARDING.INVALID_STEP);
    }
  },
};
