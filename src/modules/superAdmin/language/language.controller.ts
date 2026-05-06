import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { LanguageService } from './language.service.js';

export const createLanguage = async (req: Request, res: Response) => {
  try {
    const language = await LanguageService.createLanguage(
      req.body as { name: any; code: string },
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

export const updateLanguage = async (req: Request, res: Response) => {
  try {
    const language = await LanguageService.updateLanguage(
      req.params.id,
      req.body as { name?: any; code?: string },
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.LANGUAGE.UPDATED,
      data: language,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.LANGUAGE.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteLanguage = async (req: Request, res: Response) => {
  try {
    await LanguageService.deleteLanguage(req.params.id);

    return res.status(HttpStatus.NO_CONTENT).json({
      success: true,
      message: Messages.LANGUAGE.DELETED,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.LANGUAGE.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
