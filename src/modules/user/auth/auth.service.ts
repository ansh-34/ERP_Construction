import bcrypt from 'bcryptjs';
import type { IndustryEnum } from '../../../infra/database/prisma/generated/prisma/client/enums.js';
import { Messages } from '../../../constants/index.js';
import {
  DomainRepository,
  TokenRepository,
  OtpRepository,
  RefreshTokenRepository,
  UserRepository,
} from '../../../repositories/index.js';
import { signToken, verifyToken } from '../../../services/jwt.services.js';
import { sendMail } from '../../../services/mail.services.js';
import {
  generateOtp,
  getOtpExpiry,
  OTP_EXPIRY_MINUTES,
  verifyOtp,
} from '../../../services/otp.service.js';
import { forgotPasswordEmail } from '../../../templates/index.js';

const isReusableUserAccessToken = (
  accessToken: string | undefined,
  userId: string,
) => {
  if (!accessToken) return false;

  try {
    const decoded = verifyToken(accessToken);
    return decoded.userId === userId;
  } catch {
    return false;
  }
};

export const UserService = {
  async verifyAndActivateUser(data: { email: string; token: string }) {
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

    const dbUser = await UserRepository.findActiveByEmail(email);

    if (!dbUser) {
      throw new Error(Messages.USER.NOT_FOUND);
    }

    if (dbUser.isEmailVerified) {
      throw new Error(Messages.USER.ALREADY_VERIFIED);
    }

    const crypto = await import('crypto');
    const dummyPassword = crypto.randomBytes(6).toString('hex') + 'A1!';
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);

    await UserRepository.activateAndDeleteToken(
      dbUser.id,
      hashedPassword,
      tokenRecord.id,
    );

    return {
      email: dbUser.email,
      dummyPassword,
      industry: dbUser.industry,
      domainId: dbUser.domainId,
    };
  },

  async registerUser(
    domainId: string,
    data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      phoneCode?: string;
    },
  ) {
    const { name, email, password, phone, phoneCode } = data;

    if (!name || !email || !password || !domainId) {
      throw new Error(Messages.DOMAIN.USER_REGISTRATION_REQUIRED);
    }

    const domain = await DomainRepository.findActiveById(domainId);

    if (!domain) {
      throw new Error(Messages.DOMAIN.NOT_FOUND);
    }

    const existingUser = await UserRepository.findActiveByEmail(email);

    if (existingUser) {
      throw new Error(Messages.USER.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserRepository.create({
      name: name.trim(),
      email,
      password: hashedPassword,
      industry: domain.industry,
      phone: phone || null,
      phoneCode: phoneCode || null,
      domainId: domain.id,
    });

    const accessToken = signToken({
      userId: user.id,
      domainId: user.domainId,
      roleId: user.roleId,
      industry: user.industry,
    });

    const { token: refreshToken } = await RefreshTokenRepository.createForUser(
      user.id,
      'USER',
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        industry: user.industry,
        role: null,
      },
      domain: {
        id: domain.id,
        name: domain.name,
        industry: domain.industry,
      },
    };
  },

  async loginUser(data: {
    email: string;
    password: string;
    speciality: IndustryEnum;
  }) {
    const { email, password, speciality } = data;

    if (!email || !password || !speciality) {
      throw new Error(Messages.USER.EMAIL_PASSWORD_SPECIALITY_REQUIRED);
    }

    const user = await UserRepository.findActiveByEmailWithRoleAndDomain(email);

    if (!user) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    if (user.industry !== speciality) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const accessToken = signToken({
      userId: user.id,
      domainId: user.domainId,
      roleId: user.roleId,
      industry: user.industry,
    });

    const { token: refreshToken } = await RefreshTokenRepository.createForUser(
      user.id,
      'USER',
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        industry: user.industry,
        role: user.role?.code || null,
      },
      domain: {
        id: user.domain.id,
        name: user.domain.name,
        industry: user.domain.industry,
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

    if (existing.userType !== 'USER') {
      throw new Error(Messages.AUTH.REFRESH_TOKEN_INVALID);
    }

    const user = await UserRepository.findActiveByIdWithRoleAndDomain(
      existing.userId,
    );

    if (!user) {
      await RefreshTokenRepository.revoke(existing.id);
      throw new Error(Messages.AUTH.REFRESH_TOKEN_INVALID);
    }

    if (isReusableUserAccessToken(currentAccessToken, user.id)) {
      return {
        accessToken: currentAccessToken as string,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          industry: user.industry,
          role: user.role?.code || null,
        },
        domain: {
          id: user.domain.id,
          name: user.domain.name,
          industry: user.domain.industry,
        },
      };
    }

    const accessToken = signToken({
      userId: user.id,
      domainId: user.domainId,
      roleId: user.roleId,
      industry: user.industry,
    });

    await RefreshTokenRepository.revoke(existing.id);
    const { token: newRefreshToken } =
      await RefreshTokenRepository.createForUser(
        user.id,
        'USER',
        existing.expiry,
      );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        industry: user.industry,
        role: user.role?.code || null,
      },
      domain: {
        id: user.domain.id,
        name: user.domain.name,
        industry: user.domain.industry,
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
    userId: string,
    data: { currentPassword: string; newPassword: string },
  ) {
    const { currentPassword, newPassword } = data;

    const user = await UserRepository.findActiveByIdWithRoleAndDomain(userId);
    if (!user) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      throw new Error(Messages.AUTH.CURRENT_PASSWORD_WRONG);
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      parseInt(process.env.SALT_ROUNDS || '12', 10),
    );

    await UserRepository.updatePassword(user.id, hashedPassword);
    await RefreshTokenRepository.revokeAllForUser(user.id, 'USER');
  },

  async forgotPassword(data: { email: string }) {
    const { email } = data;

    const user = await UserRepository.findActiveByEmail(email);

    if (!user) return;

    await OtpRepository.invalidateAllByEmail(email);

    const { raw, hashed } = await generateOtp();

    await OtpRepository.create({
      otp: hashed,
      email,
      expiresAt: getOtpExpiry(),
      domainId: user.domainId,
    });

    const recipientName = user.name || 'User';

    await sendMail(
      email,
      'Password Reset — Construction ERP',
      forgotPasswordEmail({
        recipientName,
        otp: raw,
        expiryMinutes: OTP_EXPIRY_MINUTES,
      }),
    );
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

    const user = await UserRepository.findActiveByEmail(email);
    if (!user) {
      throw new Error(Messages.PASSWORD_RESET.OTP_INVALID);
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      parseInt(process.env.SALT_ROUNDS || '12', 10),
    );

    await UserRepository.updatePassword(user.id, hashedPassword);
    await OtpRepository.markUsed(otpRecord.id);
    await RefreshTokenRepository.revokeAllForUser(user.id, 'USER');
  },
};
