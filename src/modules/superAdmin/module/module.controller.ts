import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { ModuleService } from './module.service.js';
import { createModuleBodySchema } from './module.validator.js';

export const createModule = async (req: Request, res: Response) => {
  try {
    const parsed = createModuleBodySchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((err) => err.message).join(', ');
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message });
    }

    const mod = await ModuleService.createModule(
      parsed.data as { name: any; code: string },
    );

    return res
      .status(HttpStatus.CREATED)
      .json({ success: true, message: Messages.MODULE.CREATED, data: mod });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.MODULE.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listModules = async (req: Request, res: Response) => {
  try {
    const { modules, pagination } = await ModuleService.listModules(
      req.query as PaginationQuery,
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

export const updateModule = async (req: Request, res: Response) => {
  try {
    const updated = await ModuleService.updateModule(req.params.id, req.body);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.MODULE.UPDATED,
      data: updated,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.MODULE.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteModule = async (req: Request, res: Response) => {
  try {
    await ModuleService.deleteModule(req.params.id);

    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: Messages.MODULE.DELETED });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.MODULE.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
