import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Messages } from '../../../constants/index.js';
import {
  RefreshTokenRepository,
  SuperAdminRepository,
} from '../../../repositories/index.js';

type SuperAdminTokenPayload = {
  id: string;
  email: string;
};

const signSuperAdminToken = (payload: SuperAdminTokenPayload) =>
  jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1d' });

const isReusableSuperAdminAccessToken = (
  accessToken: string | undefined,
  superAdmin: { id: string; email: string },
) => {
  if (!accessToken) return false;

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET!,
    ) as SuperAdminTokenPayload;

    return decoded.id === superAdmin.id && decoded.email === superAdmin.email;
  } catch {
    return false;
  }
};

const buildSuperAdminResponse = (
  superAdmin: { id: string; email: string },
  refreshToken: string,
  accessToken?: string,
) => ({
  accessToken:
    accessToken ||
    signSuperAdminToken({
      id: superAdmin.id,
      email: superAdmin.email,
    }),
  refreshToken,
  user: {
    id: superAdmin.id,
    name: 'Superadmin',
    email: superAdmin.email,
    role: 'SUPERADMIN',
  },
});

export const SuperAdminAuthService = {
  async login(data: { identifier: string; password: string }) {
    const { identifier, password } = data;

    if (!identifier || !password) {
      throw new Error(Messages.AUTH.SUPERADMIN_EMAIL_PASSWORD_REQUIRED);
    }

    const superAdmin = await SuperAdminRepository.findActiveByEmail(identifier);

    if (!superAdmin) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(password, superAdmin.password);

    if (!isMatch) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const { token: refreshToken } = await RefreshTokenRepository.createForUser(
      superAdmin.id,
      'SUPERADMIN',
    );

    return buildSuperAdminResponse(superAdmin, refreshToken);
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

    if (existing.userType !== 'SUPERADMIN') {
      throw new Error(Messages.AUTH.REFRESH_TOKEN_INVALID);
    }

    const superAdmin = await SuperAdminRepository.findActiveById(
      existing.userId,
    );

    if (!superAdmin) {
      await RefreshTokenRepository.revoke(existing.id);
      throw new Error(Messages.AUTH.REFRESH_TOKEN_INVALID);
    }

    if (isReusableSuperAdminAccessToken(currentAccessToken, superAdmin)) {
      return buildSuperAdminResponse(
        superAdmin,
        refreshToken,
        currentAccessToken,
      );
    }

    await RefreshTokenRepository.revoke(existing.id);
    const { token: newRefreshToken } =
      await RefreshTokenRepository.createForUser(
        superAdmin.id,
        'SUPERADMIN',
        existing.expiry,
      );

    return buildSuperAdminResponse(superAdmin, newRefreshToken);
  },
};
