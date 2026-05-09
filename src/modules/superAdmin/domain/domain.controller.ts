import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { DomainService } from './domain.service.js';

const getBaseUrl = (req: Request) => `${req.protocol}://${req.get('host')}`;

export const seedDomain = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const result = await DomainService.seedDomain(req.body, getBaseUrl(req), language as string);

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.AUTH.SEED_DOMAIN_SUCCESS,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.AUTH.SEEDING_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const verifyDomainToken = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const result = await DomainService.verifyDomainToken({
      email: req.query.email as string,
      token: req.query.token as string,
    }, language as string);

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
