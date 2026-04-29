import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Messages } from '../../../constants/index.js';
import {
  DomainRepository,
  TokenRepository,
  UserRepository,
} from '../../../repositories/index.js';
import { signToken } from '../../../services/jwt.services.js';
import { sendMail } from '../../../services/mail.services.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const UserService = {
  async inviteUser(
    domainId: string,
    data: { name: string; email: string; roleId?: string },
    baseUrl: string,
  ) {
    const { name, email, roleId } = data;

    if (!email) {
      throw new Error(Messages.USER.EMAIL_REQUIRED);
    }

    const user = await UserRepository.findActiveByEmailAndDomain(
      email,
      domainId,
    );

    if (user) {
      throw new Error(Messages.USER.ALREADY_EXISTS_IN_DOMAIN);
    }

    const temporaryPassword = await bcrypt.hash(
      crypto.randomBytes(16).toString('hex'),
      10,
    );

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

    await UserRepository.create({
      name: { en: name },
      email,
      password: temporaryPassword,
      roleId: roleId || null,
      domainId,
      isEmailVerified: false,
    });

    await TokenRepository.create({
      token: rawToken,
      email,
      tokenPurpose: 'USER_EMAIL_VERIFICATION',
      tokenExpirationTime: tokenExpiresAt,
      domainId,
    });

    const verificationLink = `${baseUrl}/users/verify?token=${rawToken}&email=${encodeURIComponent(email)}`;
    await sendMail(
      email,
      'Your Verification Link',
      `<p>You have been invited to join the platform. Click the link below to verify your account:</p><p><a href="${verificationLink}">${verificationLink}</a></p><p>This link expires in 1 day.</p>`,
    );
  },

  async verifyAndActivateUser(data: {
    email: string;
    token: string;
    password: string;
  }) {
    const { email, token: rawToken, password } = data;

    if (!email || !rawToken || !password) {
      throw new Error(Messages.USER.EMAIL_TOKEN_PASSWORD_REQUIRED);
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

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserRepository.activateAndDeleteToken(
      dbUser.id,
      hashedPassword,
      tokenRecord.id,
    );
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
      name: { en: name },
      email,
      password: hashedPassword,
      phone: phone || null,
      phoneCode: phoneCode || null,
      domainId: domain.id,
    });

    const token = signToken({
      userId: user.id,
      domainId: user.domainId,
      roleId: user.roleId,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: null,
      },
      domain: {
        id: domain.id,
        name: domain.name,
      },
    };
  },

  async loginUser(data: { email: string; password: string }) {
    const { email, password } = data;

    if (!email || !password) {
      throw new Error(Messages.USER.EMAIL_PASSWORD_REQUIRED);
    }

    const user = await UserRepository.findActiveByEmailWithRoleAndDomain(email);

    if (!user) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const token = signToken({
      userId: user.id,
      domainId: user.domainId,
      roleId: user.roleId,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name || null,
      },
      domain: {
        id: user.domain.id,
        name: user.domain.name,
      },
    };
  },

  async listUsers(domainId: string, query: PaginationQuery) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, users] = await UserRepository.listByDomain(
      domainId,
      limit,
      offset,
    );

    return {
      users,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },
};
