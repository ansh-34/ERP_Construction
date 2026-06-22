import { verifyOtp } from '@/services/otp.service';
import { Messages } from '../../../constants/index';
import {
  AdminRepository,
  DomainRepository,
  OtpRepository,
  TokenRepository,
  UserRepository,
} from '../../../repositories/index.js';
import { transaction } from '@/infra/database/prisma/transaction';

export const OnboardingService = {
  async verifyTokenAndOnboard(data: { email: string; token: string }) {
    const { email, token: rawToken } = data;

    if (!email || !rawToken) {
      throw new Error(Messages.AUTH.EMAIL_TOKEN_REQUIRED);
    }

    const tokenRecord =
      await TokenRepository.findLatestActiveByEmailTokenAndPurpose(
        email,
        rawToken,
        'USER_EMAIL_VERIFICATION',
      );

    if (!tokenRecord || new Date() > tokenRecord.tokenExpirationTime) {
      throw new Error(Messages.AUTH.INVALID_OR_EXPIRED_VERIFICATION_LINK);
    }

    const user = await UserRepository.findActiveByEmail(email);

    if (!user) {
      throw new Error(Messages.DOMAIN.NOT_FOUND);
    }

    if (user.isEmailVerified) {
      throw new Error(Messages.USER.ALREADY_VERIFIED);
    }

    if (!user.adminId) {
      throw new Error(Messages.ADMIN.NOT_FOUND);
    }

    await Promise.all([
      UserRepository.verifyAndDeleteToken(user.id, tokenRecord.id),
      UserRepository.update(user.id, {
        onboardingStatus: 'COMPLETED',
      }),
    ]);

    return {
      user: {
        id: user.id,
        name: user.name || '',
        email: user.email,
        industry: user.industry,
      },
    };
  },

  async handleOtpVerification(
    otp: string,
    userId: string,
    domainId: string,
    adminId: string,
    options: { transaction?: any } = {},
  ) {
    const [user, admin, domain] = await Promise.all([
      UserRepository.findActiveById(userId, domainId),
      AdminRepository.findActiveById(adminId),
      DomainRepository.findActiveById(domainId),
    ]);
    if (!admin) {
      throw new Error(Messages.ADMIN.NOT_FOUND);
    }
    if (!domain) {
      throw new Error(Messages.DOMAIN.NOT_FOUND);
    }
    if (!user) {
      throw new Error(Messages.USER.NOT_FOUND);
    }

    const otpRecord = await OtpRepository.findLatestActive(user.email);
    if (!otpRecord) {
      throw new Error(Messages.PASSWORD_RESET.OTP_INVALID);
    }

    if (new Date() > otpRecord.expiresAt) {
      await OtpRepository.markUsed(otpRecord.id, {
        transaction: options.transaction,
      });
      throw new Error(Messages.PASSWORD_RESET.OTP_EXPIRED);
    }

    const isValid = await verifyOtp(otp, otpRecord.otp);
    if (!isValid) {
      throw new Error(Messages.PASSWORD_RESET.OTP_INVALID);
    }

    await Promise.all([
      OtpRepository.markUsed(otpRecord.id, {
        transaction: options.transaction,
      }),
      UserRepository.update(
        domain.id,
        {
          isEmailVerified: true,
        },
        {
          transaction: options.transaction,
        },
      ),
    ]);

    return true;
  },

  async onboardUser(
    data: { otp?: string },
    step: 'EMAIL_VERIFICATION',
    userId: string,
    domainId: string,
    adminId: string,
  ) {
    switch (step) {
      case 'EMAIL_VERIFICATION':
        transaction(async (tx) => {
          await Promise.all([
            this.handleOtpVerification(data.otp!, userId, domainId, adminId, {
              transaction: tx,
            }),
            UserRepository.update(userId, {
              onboardingStatus: 'COMPLETED',
            }),
          ]);
          return {
            onboardingStatus: 'COMPLETED',
            nextOnboardingStep: null,
          };
        });
        break;
      default:
        throw new Error(Messages.ONBOARDING.INVALID_STEP);
    }
  },
};
