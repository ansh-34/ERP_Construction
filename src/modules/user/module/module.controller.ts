import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { ModuleService } from './module.service.js';

export const listModules = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const { modules, pagination } = await ModuleService.listModules(
      req.query as any,
      language as string,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.MODULE.RETRIEVED,
      pagination: {
        currentCount: modules.length,
        ...pagination,
      },
      data: modules,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.MODULE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getModule = async (req: Request, res: Response) => {
  try {
    const { language } = req.headers;
    const mod = await ModuleService.getModule(
      req.params.id,
      language as string | null,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.MODULE.RETRIEVED,
      data: mod,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.MODULE.NOT_FOUND;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
