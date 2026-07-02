import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { UserIndustryAccountService } from './industryAccount.service.js';

const language = (req: Request) => (req.headers.language as string) || 'en';

export const listIndustryAccounts = async (req: Request, res: Response) => {
  try {
    const { data, pagination } = await UserIndustryAccountService.list(
      req.query,
      language(req),
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Industry accounts retrieved successfully',
      pagination: { currentCount: data.length, ...pagination },
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to list industry accounts';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};
