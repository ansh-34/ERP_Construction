import type { RefreshToken } from '../../infra/database/prisma/generated/prisma/client/client.js';
import { Messages } from '../../constants/index.js';
import {
  DomainRepository,
  RefreshTokenRepository,
  RoleRepository,
  UserRepository,
} from '../../repositories/index.js';
import { signToken, verifyToken } from '../../services/jwt.services.js';

type SupportedRefreshUserType = 'DOMAIN' | 'USER' | 'ADMIN';

type RefreshResult = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: unknown;
    email: string;
    industry?: string;
    role: string | null;
  };
  domain: {
    id: string;
    name: unknown;
    industry: string;
  };
};

function assertSupportedUserType(
  userType: string,
): asserts userType is SupportedRefreshUserType {
  if (userType !== 'DOMAIN' && userType !== 'USER' && userType !== 'ADMIN') {
    throw new Error(Messages.AUTH.REFRESH_TOKEN_INVALID);
  }
}

const isReusableAccessToken = (
  accessToken: string | undefined,
  refreshTokenRecord: RefreshToken,
) => {
  if (!accessToken) return false;

  try {
    const decoded = verifyToken(accessToken);

    if (refreshTokenRecord.userType === 'DOMAIN') {
      return (
        decoded.userId === refreshTokenRecord.userId &&
        decoded.domainId === refreshTokenRecord.userId
      );
    }

    if (refreshTokenRecord.userType === 'USER') {
      return decoded.userId === refreshTokenRecord.userId;
    }

    return false;
  } catch {
    return false;
  }
};

const validateRefreshToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new Error(Messages.AUTH.REFRESH_TOKEN_REQUIRED);
  }

  const existing = await RefreshTokenRepository.findActiveByToken(refreshToken);

  if (!existing) {
    throw new Error(Messages.AUTH.REFRESH_TOKEN_INVALID);
  }

  if (new Date() > existing.expiry) {
    await RefreshTokenRepository.revoke(existing.id);
    throw new Error(Messages.AUTH.REFRESH_TOKEN_INVALID);
  }

  assertSupportedUserType(existing.userType);

  return existing;
};

const refreshDomainToken = async (
  refreshTokenRecord: RefreshToken,
  currentRefreshToken: string,
  reusableAccessToken?: string,
): Promise<RefreshResult> => {
  const domainOwner = await DomainRepository.findActiveById(
    refreshTokenRecord.userId,
  );

  if (!domainOwner) {
    await RefreshTokenRepository.revoke(refreshTokenRecord.id);
    throw new Error(Messages.AUTH.REFRESH_TOKEN_INVALID);
  }

  const domainRole = await RoleRepository.findDomainRoleByDomain(
    domainOwner.id,
  );

  if (reusableAccessToken) {
    return {
      accessToken: reusableAccessToken,
      refreshToken: currentRefreshToken,
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
  });

  await RefreshTokenRepository.revoke(refreshTokenRecord.id);
  const { token: newRefreshToken } = await RefreshTokenRepository.createForUser(
    domainOwner.id,
    'DOMAIN',
    refreshTokenRecord.expiry,
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
};

const refreshUserToken = async (
  refreshTokenRecord: RefreshToken,
  currentRefreshToken: string,
  reusableAccessToken?: string,
): Promise<RefreshResult> => {
  const user = await UserRepository.findActiveByIdWithRoleAndDomain(
    refreshTokenRecord.userId,
  );

  if (!user) {
    await RefreshTokenRepository.revoke(refreshTokenRecord.id);
    throw new Error(Messages.AUTH.REFRESH_TOKEN_INVALID);
  }

  if (reusableAccessToken) {
    return {
      accessToken: reusableAccessToken,
      refreshToken: currentRefreshToken,
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

  await RefreshTokenRepository.revoke(refreshTokenRecord.id);
  const { token: newRefreshToken } = await RefreshTokenRepository.createForUser(
    user.id,
    'USER',
    refreshTokenRecord.expiry,
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
};

export const SharedRefreshService = {
  async refreshToken(data: {
    refreshToken: string;
    accessToken?: string;
  }): Promise<RefreshResult> {
    const existing = await validateRefreshToken(data.refreshToken);
    const reusableAccessToken = isReusableAccessToken(
      data.accessToken,
      existing,
    )
      ? data.accessToken
      : undefined;

    if (existing.userType === 'DOMAIN') {
      return refreshDomainToken(
        existing,
        data.refreshToken,
        reusableAccessToken,
      );
    }

    return refreshUserToken(existing, data.refreshToken, reusableAccessToken);
  },
};
