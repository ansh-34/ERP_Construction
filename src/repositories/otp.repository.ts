import prisma from '../infra/database/prisma/prisma.client.js';

export const OtpRepository = {
  create(data: {
    otp: string;
    email: string;
    expiresAt: Date;
    domainId?: string | null;
  }) {
    return prisma.otp.create({ data });
  },

  findLatestActive(email: string) {
    return prisma.otp.findFirst({
      where: {
        email,
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  invalidateAllByEmail(email: string) {
    return prisma.otp.updateMany({
      where: {
        email,
        isUsed: false,
      },
      data: { isUsed: true },
    });
  },

  incrementAttempts(id: string) {
    return prisma.otp.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  },

  markUsed(id: string, options: { transaction?: any } = {}) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.otp.update({
      where: { id },
      data: { isUsed: true },
    });
  },
};
