import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { OnboardingService } from './onboarding.service.js';

export const onboardAdmin = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.userId;
    const { step } = req.params;
    const result = await OnboardingService.onboardAdmin(
      req.body,
      step as
        | 'EMAIL_VERIFICATION'
        | 'LANGUAGE_SELECTION'
        | 'CURRENCY_SELECTION',
      adminId!,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ONBOARDING.STEP_COMPLETED,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.ONBOARDING.FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const languageSelectionList = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.userId;
    const { languages, pagination } =
      await OnboardingService.languageSelectionList(req.query, adminId!);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.LANGUAGE.RETRIEVED,
      data: languages,
      pagination,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.LANGUAGE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const currencySelectionList = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.userId;
    const { currencies, pagination } =
      await OnboardingService.currencySelectionList(req.query, adminId!);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.CURRENCY.RETRIEVED,
      data: currencies,
      pagination,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.CURRENCY.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
