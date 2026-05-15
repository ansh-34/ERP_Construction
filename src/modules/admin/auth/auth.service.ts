import bcrypt from 'bcryptjs';
import { Messages } from '../../../constants/index.js';
import {
  OtpRepository,
  RefreshTokenRepository,
  AdminRepository,
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
import { otpVerificationEmail } from '@/templates/emailVerification.template.js';

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
  async login(data: { identifier: string; password: string }) {
    const { identifier, password } = data;

    if (!identifier || !password) {
      throw new Error(Messages.AUTH.EMAIL_PASSWORD_REQUIRED);
    }

    const admin = await AdminRepository.findActiveByEmail(identifier);
    if (!admin) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const accessToken = signToken({
      userId: admin.id,
      domainId: '',
      adminId: admin.id,
      roleId: 'ADMIN',
      industry: '',
    });

    const { token: refreshToken } = await RefreshTokenRepository.createForUser(
      admin.id,
      'ADMIN',
    );

    if (
      admin.isEmailVerified === false ||
      (admin.onboardingStatus === 'PENDING' &&
        admin.onboardingStep === 'EMAIL_VERIFICATION')
    ) {
      await OtpRepository.invalidateAllByEmail(admin.email);
      const { raw, hashed } = await generateOtp();

      await Promise.all([
        OtpRepository.create({
          otp: hashed,
          email: admin.email,
          expiresAt: getOtpExpiry(),
        }),
        sendMail(
          admin.email,
          'Your Verification Code — Construction ERP',
          otpVerificationEmail({
            recipientName: admin.name,
            otp: raw,
            expiryMinutes: OTP_EXPIRY_MINUTES,
          }),
        ),
      ]);
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'ADMIN',
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

    if (existing.userType !== 'ADMIN') {
      throw new Error(Messages.AUTH.REFRESH_TOKEN_INVALID);
    }

    const admin = await AdminRepository.findActiveById(existing.userId);
    if (!admin) {
      await RefreshTokenRepository.revoke(existing.id);
      throw new Error(Messages.AUTH.REFRESH_TOKEN_INVALID);
    }

    if (isReusableDomainAccessToken(currentAccessToken, admin.id)) {
      return {
        accessToken: currentAccessToken as string,
        refreshToken,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: 'ADMIN',
        },
      };
    }

    const accessToken = signToken({
      userId: admin.id,
      domainId: '',
      adminId: admin.id,
      roleId: '',
      industry: '',
    });

    await RefreshTokenRepository.revoke(existing.id);
    const { token: newRefreshToken } =
      await RefreshTokenRepository.createForUser(
        admin.id,
        'ADMIN',
        existing.expiry,
      );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'ADMIN',
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
    adminId: string,
    data: { currentPassword: string; newPassword: string },
  ) {
    const { currentPassword, newPassword } = data;

    const admin = await AdminRepository.findActiveById(adminId);
    if (!admin) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const passwordMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!passwordMatch) {
      throw new Error(Messages.AUTH.CURRENT_PASSWORD_WRONG);
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      parseInt(process.env.SALT_ROUNDS || '12', 10),
    );

    await Promise.all([
      AdminRepository.update(admin.id, { password: hashedPassword }),
      RefreshTokenRepository.revokeAllForUser(admin.id, 'DOMAIN'),
    ]);
  },

  async forgotPassword(data: { email: string }) {
    const { email } = data;

    const admin = await AdminRepository.findActiveByEmail(email);
    if (!admin) return;

    await OtpRepository.invalidateAllByEmail(email);

    const { raw, hashed } = await generateOtp();

    await OtpRepository.create({
      otp: hashed,
      email,
      expiresAt: getOtpExpiry(),
    });

    const recipientName = admin.name;

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

    const admin = await AdminRepository.findActiveByEmail(email);
    if (!admin) {
      throw new Error(Messages.PASSWORD_RESET.OTP_INVALID);
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      parseInt(process.env.SALT_ROUNDS || '12', 10),
    );

    await Promise.all([
      AdminRepository.update(admin.id, { password: hashedPassword }),
      OtpRepository.markUsed(otpRecord.id),
      RefreshTokenRepository.revokeAllForUser(admin.id, 'ADMIN'),
    ]);
  },
};
