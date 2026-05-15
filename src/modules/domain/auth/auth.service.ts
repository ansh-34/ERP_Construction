import bcrypt from 'bcryptjs';
import type { IndustryEnum } from '../../../infra/database/prisma/generated/prisma/client/enums.js';
import { Messages } from '../../../constants/index.js';
import {
  DomainRepository,
  RoleRepository,
  OtpRepository,
  RefreshTokenRepository,
} from '../../../repositories/index.js';
import { signToken, verifyToken } from '../../../services/jwt.services.js';
import { sendMail } from '../../../services/mail.services.js';
import {
  generateOtp,
  getOtpExpiry,
  OTP_EXPIRY_MINUTES,
  verifyOtp,
  // MAX_OTP_ATTEMPTS,
} from '../../../services/otp.service.js';
import { forgotPasswordEmail } from '../../../templates/index.js';
import variables from '../../../config/variables.config.js';

const isReusableDomainAccessToken = (
  accessToken: string | undefined,
  domainId: string,
) => {
  if (!accessToken) return false;

  try {
    const decoded = verifyToken(accessToken);
    return decoded.userId === domainId && decoded.domainId === domainId;
  } catch {
    return false;
  }
};

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

    if (!domainOwner.isEmailVerified) {
      throw new Error(Messages.AUTH.EMAIL_VERIFICATION_REQUIRED);
    }

    if (domainOwner.industry !== speciality) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const passwordMatch = await bcrypt.compare(password, domainOwner.password);
    if (!passwordMatch) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const domainRole = await RoleRepository.findDomainRoleByDomain(
      domainOwner.id,
    );

    const accessToken = signToken({
      userId: domainOwner.id,
      domainId: domainOwner.id,
      roleId: domainRole?.id || '',
      industry: domainOwner.industry,
      adminId: domainOwner.adminId ?? undefined,
    });

    const { token: refreshToken } = await RefreshTokenRepository.createForUser(
      domainOwner.id,
      'DOMAIN',
    );

    // if (
    //   domainOwner.isEmailVerified === false ||
    //   (domainOwner.onboardingStatus === 'PENDING' &&
    //     domainOwner.onboardingStep === 'EMAIL_VERIFICATION')
    // ) {
    //   await OtpRepository.invalidateAllByEmail(domainOwner.email);
    //   const { raw, hashed } = await generateOtp();
    //
    //   await Promise.all([
    //     OtpRepository.create({
    //       otp: hashed,
    //       email: domainOwner.email,
    //       expiresAt: getOtpExpiry(),
    //       domainId: domainOwner.id,
    //     }),
    //     sendMail(
    //       domainOwner.email,
    //       'Your Verification Code — Construction ERP',
    //       forgotPasswordEmail({
    //         recipientName:
    //           typeof domainOwner.name === 'object' && domainOwner.name !== null
    //             ? (domainOwner.name as Record<string, string>).en || 'User'
    //             : String(domainOwner.name || 'User'),
    //         otp: raw,
    //         expiryMinutes: OTP_EXPIRY_MINUTES,
    //       }),
    //     ),
    //   ]);
    // }

    return {
      accessToken,
      refreshToken,
      user: {
        id: domainOwner.id,
        name: domainOwner.name,
        email: domainOwner.email,
        role: domainRole?.code || 'domain',
      },
      domain: {
        id: domainOwner.id,
        name: domainOwner.name,
        industry: domainOwner.industry,
      },
    };
  },

  async refreshToken(data: { refreshToken: string; accessToken?: string }) {
    const { accessToken: currentAccessToken, refreshToken } = data;

    if (!refreshToken) {
      throw new Error(Messages.AUTH.REFRESH_TOKEN_REQUIRED);
    }

    const existing =
      await RefreshTokenRepository.findActiveByToken(refreshToken);

    if (!existing) {
      throw new Error(Messages.AUTH.REFRESH_TOKEN_INVALID);
    }

    if (new Date() > existing.expiry) {
      await RefreshTokenRepository.revoke(existing.id);
      throw new Error(Messages.AUTH.REFRESH_TOKEN_INVALID);
    }

    if (existing.userType !== 'DOMAIN') {
      throw new Error(Messages.AUTH.REFRESH_TOKEN_INVALID);
    }

    const domainOwner = await DomainRepository.findActiveById(existing.userId);
    if (!domainOwner) {
      await RefreshTokenRepository.revoke(existing.id);
      throw new Error(Messages.AUTH.REFRESH_TOKEN_INVALID);
    }

    const domainRole = await RoleRepository.findDomainRoleByDomain(
      domainOwner.id,
    );

    if (isReusableDomainAccessToken(currentAccessToken, domainOwner.id)) {
      return {
        accessToken: currentAccessToken as string,
        refreshToken,
        user: {
          id: domainOwner.id,
          name: domainOwner.name,
          email: domainOwner.email,
          role: domainRole?.code || 'domain',
        },
        domain: {
          id: domainOwner.id,
          name: domainOwner.name,
          industry: domainOwner.industry,
        },
      };
    }

    const accessToken = signToken({
      userId: domainOwner.id,
      domainId: domainOwner.id,
      roleId: domainRole?.id || '',
      industry: domainOwner.industry,
      adminId: domainOwner.adminId ?? undefined,
    });

    await RefreshTokenRepository.revoke(existing.id);
    const { token: newRefreshToken } =
      await RefreshTokenRepository.createForUser(
        domainOwner.id,
        'DOMAIN',
        existing.expiry,
      );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: domainOwner.id,
        name: domainOwner.name,
        email: domainOwner.email,
        role: domainRole?.code || 'domain',
      },
      domain: {
        id: domainOwner.id,
        name: domainOwner.name,
        industry: domainOwner.industry,
      },
    };
  },

  async logout(data: { refreshToken: string }) {
    const { refreshToken } = data;

    if (!refreshToken) {
      throw new Error(Messages.AUTH.REFRESH_TOKEN_REQUIRED);
    }

    const existing =
      await RefreshTokenRepository.findActiveByToken(refreshToken);

    if (existing) {
      await RefreshTokenRepository.revoke(existing.id);
    }
  },

  async changePassword(
    domainId: string,
    data: { currentPassword: string; newPassword: string },
  ) {
    const { currentPassword, newPassword } = data;

    const domain = await DomainRepository.findActiveById(domainId);
    if (!domain) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      domain.password,
    );
    if (!passwordMatch) {
      throw new Error(Messages.AUTH.CURRENT_PASSWORD_WRONG);
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      parseInt(process.env.SALT_ROUNDS || '12', 10),
    );

    await DomainRepository.updatePassword(domain.id, hashedPassword);
    await RefreshTokenRepository.revokeAllForUser(domain.id, 'DOMAIN');
  },

  async forgotPassword(data: { email: string }) {
    const { email } = data;

    const domain = await DomainRepository.findActiveByEmail(email);

    if (!domain) return;

    await OtpRepository.invalidateAllByEmail(email);

    const { raw, hashed } = await generateOtp();

    await OtpRepository.create({
      otp: hashed,
      email,
      expiresAt: getOtpExpiry(),
      domainId: domain.id,
    });

    const recipientName =
      typeof domain.name === 'object' && domain.name !== null
        ? (domain.name as Record<string, string>).en || 'User'
        : String(domain.name || 'User');

    await sendMail(
      email,
      'Password Reset — Construction ERP',
      forgotPasswordEmail({
        recipientName,
        otp: raw,
        expiryMinutes: OTP_EXPIRY_MINUTES,
      }),
    );

    return variables.NODE_ENV === 'development'
      ? { otp: raw }
      : { message: 'OTP sent successfully' };
  },

  async resetPassword(data: {
    email: string;
    otp: string;
    newPassword: string;
  }) {
    const { email, otp, newPassword } = data;

    const otpRecord = await OtpRepository.findLatestActive(email);

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

    const domain = await DomainRepository.findActiveByEmail(email);
    if (!domain) {
      throw new Error(Messages.PASSWORD_RESET.OTP_INVALID);
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      parseInt(process.env.SALT_ROUNDS || '12', 10),
    );

    await DomainRepository.updatePassword(domain.id, hashedPassword);
    await OtpRepository.markUsed(otpRecord.id);
    await RefreshTokenRepository.revokeAllForUser(domain.id, 'DOMAIN');
  },
};
