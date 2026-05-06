import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { ModuleService } from './module.service.js';

export const createModule = async (req: Request, res: Response) => {
  try {
    const mod = await ModuleService.createModule(
      req.body as {
        name: any;
        dependencyModules?: { moduleId: string; permissionIds: string[] }[];
        modulePermissionIds?: string[];
      },
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
    console.error('Error updating module:', error);
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
