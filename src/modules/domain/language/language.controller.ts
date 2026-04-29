import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { LanguageService } from './language.service.js';
import { createLanguageBodySchema } from './language.validator.js';

export const createLanguage = async (req: Request, res: Response) => {
  try {
    const parsed = createLanguageBodySchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((err) => err.message).join(', ');
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message });
    }

    const language = await LanguageService.createLanguage(
      parsed.data as { name: any; code: string },
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.LANGUAGE.CREATED,
      data: language,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.LANGUAGE.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listLanguages = async (req: Request, res: Response) => {
  try {
    const { languages, pagination } = await LanguageService.listLanguages(
      req.query as PaginationQuery,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.LANGUAGE.RETRIEVED,
      pagination: {
        currentCount: languages.length,
        ...pagination,
      },
      data: languages,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.LANGUAGE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
