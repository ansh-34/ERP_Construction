import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { UserLanguageService } from './language.service.js';

export const listLanguages = async (req: Request, res: Response) => {
  try {
    const { languages, pagination } = await UserLanguageService.listLanguages(
      req.query,
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

export const getLanguage = async (req: Request, res: Response) => {
  try {
    const language = await UserLanguageService.getLanguage(req.params.id);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.LANGUAGE.RETRIEVED,
      data: language,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.LANGUAGE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
