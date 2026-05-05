import crypto from 'crypto';
import prisma from '../infra/database/prisma/prisma.client.js';
import type { UserTypeEnum } from '../infra/database/prisma/generated/prisma/client/enums.js';

const REFRESH_TOKEN_EXPIRY_DAYS = 30;

function generateTokenString(): string {
  return crypto.randomBytes(32).toString('hex');
}

function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
}

export const RefreshTokenRepository = {
  async createForUser(
    userId: string,
    userType: UserTypeEnum,
    customExpiry?: Date,
  ) {
    const token = generateTokenString();
    const expiry = customExpiry || getRefreshTokenExpiry();

    const record = await prisma.refreshToken.create({
      data: {
        token,
        expiry,
        userType,
        userId,
      },
    });

    return { token: record.token, expiry: record.expiry };
  },

  findActiveByToken(token: string) {
    return prisma.refreshToken.findFirst({
      where: {
        token,
        isDeleted: false,
        status: 'active',
      },
    });
  },

  revoke(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { isDeleted: true },
    });
  },

  revokeAllForUser(userId: string, userType: UserTypeEnum) {
    return prisma.refreshToken.updateMany({
      where: {
        userId,
        userType,
        isDeleted: false,
      },
      data: { isDeleted: true },
    });
  },
};
