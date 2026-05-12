import { verifyOtp } from '@/services/otp.service.js';
import { Messages } from '../../../constants/index.js';
import {
  AdminCurrencyRepository,
  AdminLanguageRepository,
  AdminRepository,
  OtpRepository,
} from '../../../repositories/index.js';
import { sendMail } from '@/services/mail.services.js';
import { onboardingCompletionEmail } from '@/templates/adminOnboardSuccess.template.js';
import { variables } from '@/config/index.js';
import { normalizePagination, PaginationQuery } from '@/utils/pagination.js';

export const OnboardingService = {
  async handleOtpVerification(otp: string, adminId: string) {
    const admin = await AdminRepository.findActiveById(adminId);
    if (!admin) {
      throw new Error(Messages.ADMIN.NOT_FOUND);
    }

    const otpRecord = await OtpRepository.findLatestActive(admin.email);
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

    await Promise.all([
      OtpRepository.markUsed(otpRecord.id),
      AdminRepository.update(admin.id, {
        onboardingStatus: 'INPROGRESS',
        onboardingStep: 'LANGUAGE_SELECTION',
        isEmailVerified: true,
      }),
    ]);

    return true;
  },
  async handleLanguageSelection(languageIds: string[], adminId: string) {
    const areLanguagesValid =
      await AdminLanguageRepository.validateAdminLanguages({
        languageIds,
        adminId,
      });
    if (!areLanguagesValid) {
      throw new Error(Messages.ONBOARDING.INVALID_LANGUAGES);
    }

    await Promise.all([
      AdminRepository.update(adminId, { onboardingStep: 'CURRENCY_SELECTION' }),
      AdminLanguageRepository.enableLanguages(adminId, languageIds),
    ]);

    return true;
  },
  async handleCurrencySelection(currencyIds: string[], adminId: string) {
    console.log(currencyIds);
    const areCurrenciesValid =
      await AdminCurrencyRepository.validateAdminCurrencies({
        adminId,
        currencyIds,
      });
    if (!areCurrenciesValid) {
      throw new Error(Messages.ONBOARDING.INVALID_CURRENCIES);
    }

    const admin = await AdminRepository.findActiveById(adminId);
    if (!admin) {
      throw new Error(Messages.ADMIN.NOT_FOUND);
    }

    await Promise.all([
      AdminRepository.update(adminId, {
        onboardingStatus: 'COMPLETED',
      }),
      AdminCurrencyRepository.enableCurrencies(adminId, currencyIds),
      sendMail(
        admin.email,
        'Welcome Aboard — Your Setup is Complete 🎉',
        onboardingCompletionEmail({
          recipientName: admin.name,
          dashboardLink: variables.CLIENT_BASE_URL,
        }),
      ),
    ]);

    return true;
  },
  async onboardAdmin(
    data: { otp?: string; languageIds?: string[]; currencyIds?: string[] },
    step: 'EMAIL_VERIFICATION' | 'LANGUAGE_SELECTION' | 'CURRENCY_SELECTION',
    adminId: string,
  ) {
    switch (step) {
      case 'EMAIL_VERIFICATION':
        return await this.handleOtpVerification(data.otp!, adminId);
      case 'LANGUAGE_SELECTION':
        return await this.handleLanguageSelection(data.languageIds!, adminId);
      case 'CURRENCY_SELECTION':
        return await this.handleCurrencySelection(data.currencyIds!, adminId);
    }
  },
  async languageSelectionList(
    query: PaginationQuery & {
      searchKey?: string;
      status?: 'active' | 'inactive';
    },
    adminId: string,
  ) {
    const { offset, limit } = normalizePagination({
      limit: query.limit,
      offset: query.offset,
    });
    const [totalCount, languages] = await AdminLanguageRepository.listActive(
      limit,
      offset,
      {
        filters: {
          searchKey: query.searchKey || '',
          ...(query.status && { status: query.status }),
          isEnabled: false,
          adminId,
        },
      },
    );

    return {
      languages,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },
  async currencySelectionList(
    query: PaginationQuery & {
      searchKey?: string;
      status?: 'active' | 'inactive';
      isEnabled?: boolean;
      isDefault?: boolean;
    },
    adminId: string,
  ) {
    const { offset, limit } = normalizePagination({
      limit: query.limit,
      offset: query.offset,
    });

    const [totalCount, currencies] = await AdminCurrencyRepository.listActive(
      limit,
      offset,
      {
        filters: {
          searchKey: query.searchKey || '',
          ...(query.status && { status: query.status }),
          isEnabled: false,
          ...(Object.prototype.hasOwnProperty.call(query, 'isDefault') && {
            isDefault: query.isDefault,
          }),
          adminId,
        },
      },
    );

    return {
      currencies,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },
};
