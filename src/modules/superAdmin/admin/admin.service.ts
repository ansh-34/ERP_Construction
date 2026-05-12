import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Messages } from '../../../constants/index.js';
import {
  AdminCurrencyRepository,
  AdminLanguageRepository,
  AdminRepository,
  CurrencyRepository,
  LanguageRepository,
} from '../../../repositories/index.js';
import { sendMail } from '../../../services/mail.services.js';
import { adminInviteEmail } from '../../../templates/index.js';
import { variables } from '@/config/index.js';
import { normalizePagination } from '@/utils/pagination.js';
import { transaction } from '@/infra/database/prisma/transaction.js';

export const AdminService = {
  async createAdmin(data: {
    name: string;
    email: string;
    phoneCode: string;
    phone: string;
    mediaId?: string;
    offeredLanguages?: string[];
    offeredCurrencies?: string[];
  }) {
    const { name, email, phoneCode, phone, mediaId } = data;

    const [
      adminWithSameEmail,
      allAreValidOfferedLanguages,
      allAreValidOfferedCurrencies,
      defaultLanguage,
      defaultCurrency,
    ] = await Promise.all([
      AdminRepository.findActiveByEmail(email),
      LanguageRepository.validateLanguages(data.offeredLanguages || []),
      CurrencyRepository.validateCurrencies(data.offeredCurrencies || []),
      LanguageRepository.findActiveByCode('en'),
      CurrencyRepository.findActiveByCode('DOLLAR'),
    ]);

    if (adminWithSameEmail) {
      throw new Error(Messages.ADMIN.ALREADY_EXISTS);
    }
    if (!allAreValidOfferedLanguages) {
      throw new Error(Messages.ADMIN.INVALID_OFFERED_LANGUAGES);
    }
    if (!allAreValidOfferedCurrencies) {
      throw new Error(Messages.ADMIN.INVALID_OFFERED_CURRENCIES);
    }

    if (!defaultLanguage) {
      throw new Error(Messages.ADMIN.DEFAULT_LANGUAGE_NOT_FOUND);
    }
    if (!defaultCurrency) {
      throw new Error(Messages.ADMIN.DEFAULT_CURRENCY_NOT_FOUND);
    }

    const temporaryPassword = await bcrypt.hash(
      crypto.randomBytes(16).toString('hex'),
      10,
    );

    return transaction(async (tx) => {
      const admin = await Promise.all([
        AdminRepository.create(
          {
            name: name?.trim() as string,
            email,
            password: temporaryPassword,
            phoneCode,
            phone,
            mediaId,
          },
          {
            transaction: tx,
          },
        ),
        sendMail(
          email,
          'Welcome to Construction ERP — Let’s Build Something Great Together',
          adminInviteEmail({
            recipientName: name,
            loginUrl: `${variables.CLIENT_BASE_URL}/sign-in`,
          }),
        ),
      ]);

      const laguagesToOffer = [
        ...new Set([defaultLanguage.id, ...(data.offeredLanguages || [])]),
      ].map((id) => ({
        adminId: admin[0].id,
        languageId: id,
        isDefault: id === defaultLanguage.id,
        isEnabled: false,
      }));

      const currenciesToOffer = [
        ...new Set([defaultCurrency.id, ...(data.offeredCurrencies || [])]),
      ].map((id) => ({
        adminId: admin[0].id,
        currencyId: id,
        isDefault: id === defaultCurrency.id,
        isEnabled: false,
      }));

      await Promise.all([
        AdminLanguageRepository.bulkCreate(laguagesToOffer, {
          transaction: tx,
        }),
        AdminCurrencyRepository.bulkCreate(currenciesToOffer, {
          transaction: tx,
        }),
      ]);

      return admin[0];
    });
  },
  async listAdmins(query: any) {
    const { searchKey, status } = query;

    const { offset, limit } = normalizePagination({
      limit: query.limit,
      offset: query.offset,
    });

    const [totalCount, admins] = await AdminRepository.listActive(
      limit,
      offset,
      {
        filters: {
          searchKey,
          status,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          phoneCode: true,
          media: {
            select: {
              id: true,
              url: true,
            },
          },
          onboardingStatus: true,
          onboardingStep: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    );

    return {
      admins,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },
  async getAdmin(id: string) {
    return await AdminRepository.findActiveById(id, {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneCode: true,
        media: {
          select: {
            id: true,
            url: true,
          },
        },
        onboardingStatus: true,
        onboardingStep: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
  async updateAdmin(
    id: string,
    data: {
      name: string;
      email: string;
      phoneCode: string;
      phone: string;
      mediaId?: string;
      isEmailVerified?: boolean;
    },
  ) {
    if (data.email) {
      const adminWithSameEmail = await AdminRepository.findActiveByEmail(
        data.email,
      );
      if (adminWithSameEmail && adminWithSameEmail.id !== id) {
        throw new Error(Messages.ADMIN.ALREADY_EXISTS);
      }
      data.isEmailVerified = false;
    }
    return await AdminRepository.update(id, data);
  },
  async deleteAdmin(id: string) {
    return await AdminRepository.softDelete(id);
  },
};
