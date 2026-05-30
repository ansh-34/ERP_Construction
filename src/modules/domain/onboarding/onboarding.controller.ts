import { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { OnboardingService } from './onboarding.service.js';

export const verifyOnboardToken = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const result = await OnboardingService.verifyTokenAndOnboard(
      {
        email: req.query.email as string,
        token: req.query.token as string,
      },
      language as string,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.AUTH.VERIFY_DOMAIN_SUCCESS,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.AUTH.VERIFICATION_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const onboardDomain = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.adminId;
    const domainId = req.user?.domainId;
    const { step } = req.params;
    const result = await OnboardingService.onboardDomain(
      req.body,
      step as 'EMAIL_VERIFICATION',
      domainId!,
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
