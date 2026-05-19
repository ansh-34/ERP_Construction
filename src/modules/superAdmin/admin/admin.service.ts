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
      const updatedOfferedLanguages = [
        ...new Set([defaultLanguage.id, ...(data.offeredLanguages || [])]),
      ];
      const updatedOfferedCurrencies = [
        ...new Set([defaultCurrency.id, ...(data.offeredCurrencies || [])]),
      ];
      const admin = await Promise.all([
        AdminRepository.create(
          {
            name: name?.trim() as string,
            email,
            password: temporaryPassword,
            phoneCode,
            phone,
            mediaId,
            offeredLanguagesCount: updatedOfferedLanguages?.length || 0,
            offeredCurrenciesCount: updatedOfferedCurrencies?.length || 0,
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

      const languagesToOffer = updatedOfferedLanguages.map((id) => ({
        adminId: admin[0].id,
        languageId: id,
        isDefault: id === defaultLanguage.id,
        isEnabled: false,
      }));

      const currenciesToOffer = updatedOfferedCurrencies.map((id) => ({
        adminId: admin[0].id,
        currencyId: id,
        isDefault: id === defaultCurrency.id,
        isEnabled: false,
      }));

      await Promise.all([
        AdminLanguageRepository.bulkCreate(languagesToOffer, {
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
          offeredLanguagesCount: true,
          enabledLanguagesCount: true,
          offeredCurrenciesCount: true,
          enabledCurrenciesCount: true,
          onboardingStatus: true,
          onboardingStep: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    );

    return {
      admins: admins.map((admin) => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        phoneCode: admin.phoneCode,
        media: admin.media,
        onboardingStatus: admin.onboardingStatus,
        onboardingStep: admin.onboardingStep,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
        offeredLanguagesCount: admin.offeredLanguagesCount,
        enabledLanguagesCount: admin.enabledLanguagesCount,
        offeredCurrenciesCount: admin.offeredCurrenciesCount,
        enabledCurrenciesCount: admin.enabledCurrenciesCount,
      })),
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },
  async getAdmin(id: string, langCode: string | null) {
    const admin = await AdminRepository.findActiveById(id, {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneCode: true,
        offeredLanguagesCount: true,
        enabledLanguagesCount: true,
        offeredCurrenciesCount: true,
        enabledCurrenciesCount: true,
        media: {
          select: {
            id: true,
            url: true,
          },
        },
        adminLanguages: {
          select: {
            id: true,
            language: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        adminCurrencies: {
          select: {
            id: true,
            currency: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        onboardingStatus: true,
        onboardingStep: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      phoneCode: admin.phoneCode,
      media: admin.media,
      adminLanguages: admin.adminLanguages,
      adminCurrencies: admin.adminCurrencies.map((currency: any) => ({
        id: currency.currency.id,
        code: currency.currency.code,
        name: langCode
          ? currency.currency.name[langCode]
          : currency.currency.name.en || '',
      })),
      onboardingStatus: admin.onboardingStatus,
      onboardingStep: admin.onboardingStep,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      offeredLanguagesCount: admin.offeredLanguagesCount || 0,
      enabledLanguagesCount: admin.enabledLanguagesCount || 0,
      offeredCurrenciesCount: admin.offeredCurrenciesCount || 0,
      enabledCurrenciesCount: admin.enabledCurrenciesCount || 0,
    };
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
