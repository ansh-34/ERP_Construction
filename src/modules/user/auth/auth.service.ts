import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { IndustryEnum } from '../../../infra/database/prisma/generated/prisma/client/enums.js';
import { Messages } from '../../../constants/index.js';
import {
  DomainRepository,
  TokenRepository,
  OtpRepository,
  RefreshTokenRepository,
  UserRepository,
  RoleRepository,
  RoleModulePermissionRepository,
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
import variables from '../../../config/variables.config.js';

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

    if (!domain.adminId) {
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
      adminId: domain.adminId,
    });

    // const verificationToken = crypto.randomBytes(32).toString('hex');
    // const tokenExpirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // await TokenRepository.create({
    //   token: verificationToken,
    //   email,
    //   tokenPurpose: 'USER_EMAIL_VERIFICATION',
    //   tokenExpirationTime,
    //   domainId: domain.id,
    // });

    // const { userInviteEmail } = await import('../../../templates/index.js');
    // const verificationLink = `${variables.CLIENT_BASE_URL}/verify?email=${encodeURIComponent(email)}&token=${verificationToken}`;

    // await sendMail(
    //   email,
    //   'Welcome to Construction ERP - Verify your account',
    //   userInviteEmail({
    //     recipientName: name.trim(),
    //     domainName: typeof domain.name === 'object' && domain.name !== null ? (domain.name as Record<string, string>).en || 'Construction ERP' : String(domain.name || 'Construction ERP'),
    //     verificationLink,
    //   })
    // );

    const accessToken = signToken({
      userId: user.id,
      domainId: user.domainId,
      adminId: domain.adminId,
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
        role: { code: 'USER', name: { en: 'User' } },
      },
      domain: {
        id: domain.id,
        name: domain.name,
        industry: domain.industry,
        adminId: domain.adminId,
      },
    };
  },

  async loginUser(data: {
    identifier: string;
    password: string;
    speciality: IndustryEnum;
  }) {
    const { identifier, password, speciality } = data;

    if (!identifier || !password || !speciality) {
      throw new Error(Messages.USER.EMAIL_PASSWORD_SPECIALITY_REQUIRED);
    }

    const user =
      await UserRepository.findActiveByIdentifierWithRoleAndDomain(identifier);

    if (!user) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    if (user.industry !== speciality) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    if (!user.domain.adminId) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const accessToken = signToken({
      userId: user.id,
      domainId: user.domainId,
      adminId: user.domain.adminId,
      roleId: user.roleId,
      industry: user.industry,
    });

    const { token: refreshToken } = await RefreshTokenRepository.createForUser(
      user.id,
      'USER',
    );

    // -- User Onboarding Flow --
    // Uncomment when user onboarding steps are implemented.
    //
    // if (
    //   user.isEmailVerified === false ||
    //   (user.onboardingStatus === 'PENDING' &&
    //     user.onboardingStep === 'EMAIL_VERIFICATION')
    // ) {
    //   await OtpRepository.invalidateAllByEmail(user.email);
    //   const { raw, hashed } = await generateOtp();
    //
    //   await Promise.all([
    //     OtpRepository.create({
    //       otp: hashed,
    //       email: user.email,
    //       expiresAt: getOtpExpiry(),
    //       domainId: user.domainId,
    //     }),
    //     sendMail(
    //       user.email,
    //       'Your Verification Code — Construction ERP',
    //       forgotPasswordEmail({
    //         recipientName: user.name || 'User',
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
        id: user.id,
        name: user.name,
        email: user.email,
        industry: user.industry,
        role: user.role
          ? {
              code: (user.role.code || 'USER').toUpperCase(),
              name: user.role.name,
            }
          : { code: 'USER', name: { en: 'User' } },
        onboardingStatus: 'COMPLETED',
        onboardingStep: 'EMAIL_VERIFICATION',
      },
      domain: {
        id: user.domain.id,
        name: user.domain.name,
        industry: user.domain.industry,
        adminId: user.domain.adminId,
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

    if (!user.domain.adminId) {
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
          role: user.role
            ? {
                code: (user.role.code || 'USER').toUpperCase(),
                name: user.role.name,
              }
            : { code: 'USER', name: { en: 'User' } },
        },
        domain: {
          id: user.domain.id,
          name: user.domain.name,
          industry: user.domain.industry,
          adminId: user.domain.adminId,
        },
      };
    }

    const accessToken = signToken({
      userId: user.id,
      domainId: user.domainId,
      adminId: user.domain.adminId,
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
        role: user.role
          ? {
              code: (user.role.code || 'USER').toUpperCase(),
              name: user.role.name,
            }
          : { code: 'USER', name: { en: 'User' } },
      },
      domain: {
        id: user.domain.id,
        name: user.domain.name,
        industry: user.domain.industry,
        adminId: user.domain.adminId,
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

    return variables.NODE_ENV === 'development'
      ? { otp: raw }
      : { message: 'OTP sent successfully' };
  },

  async verifyOtp(data: { email: string; otp: string }) {
    const { email, otp } = data;

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

    await OtpRepository.markUsed(otpRecord.id);

    const resetTokenStr = crypto.randomBytes(32).toString('hex');
    const tokenExpirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await TokenRepository.create({
      token: resetTokenStr,
      email,
      tokenPurpose: 'PASSWORD_RESET',
      tokenExpirationTime,
    });

    return { resetToken: resetTokenStr };
  },

  async resetPassword(data: { resetToken: string; newPassword: string }) {
    const { resetToken, newPassword } = data;

    const tokenRecord = await TokenRepository.findActiveByTokenAndPurpose(
      resetToken,
      'PASSWORD_RESET',
    );

    if (!tokenRecord || new Date() > tokenRecord.tokenExpirationTime) {
      throw new Error(Messages.PASSWORD_RESET.TOKEN_INVALID_OR_EXPIRED);
    }

    const user = await UserRepository.findActiveByEmail(tokenRecord.email);
    if (!user) {
      throw new Error(Messages.PASSWORD_RESET.TOKEN_INVALID_OR_EXPIRED);
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      parseInt(process.env.SALT_ROUNDS || '12', 10),
    );

    await UserRepository.updatePassword(user.id, hashedPassword);
    await TokenRepository.markDeleted(tokenRecord.id);
    await RefreshTokenRepository.revokeAllForUser(user.id, 'USER');
  },

  async getMyPermissions(
    userId: string,
    domainId: string,
    roleId: string | null,
  ) {
    const user = await UserRepository.findActiveByIdWithRoleAndDomain(userId);
    if (!user) {
      throw new Error(Messages.USER.NOT_FOUND);
    }

    if (!roleId) {
      return {
        role: { code: 'USER', name: { en: 'User' } },
        modules: [],
        permissions: [],
      };
    }

    const role = await RoleRepository.findActiveByIdAndDomain(roleId, domainId);
    if (!role) {
      return {
        role: null,
        modules: [],
        permissions: [],
      };
    }

    const roleModulePermissions =
      await RoleModulePermissionRepository.findByRoleIdAndDomainId(
        roleId,
        domainId,
      );

    const modules = roleModulePermissions.map((rmp) => ({
      ...rmp.module,
      permissions: rmp.permissions,
    }));

    return {
      role: {
        id: role.id,
        name: role.name,
        code: (role.code || 'USER').toUpperCase(),
        domainUserTypeCode: (role as any).domainUserTypeCode ?? null,
      },
      modules,
    };
  },
};
