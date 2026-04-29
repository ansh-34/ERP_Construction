import prisma from '../infra/database/prisma/prisma.client.js';

export const TokenRepository = {
  create(data: {
    token: string;
    email: string;
    tokenPurpose: string;
    tokenExpirationTime: Date;
    domainId?: string | null;
  }) {
    return prisma.token.create({ data });
  },

  findLatestActiveByEmailTokenAndPurpose(
    email: string,
    token: string,
    tokenPurpose: string,
  ) {
    return prisma.token.findFirst({
      where: {
        email,
        token,
        tokenPurpose,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  markDeleted(id: string) {
    return prisma.token.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
