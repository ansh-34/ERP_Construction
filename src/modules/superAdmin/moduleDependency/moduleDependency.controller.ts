import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { ModuleDependencyService } from './moduleDependency.service.js';

export const createModuleDependency = async (req: Request, res: Response) => {
  try {
    const dependency = await ModuleDependencyService.createModuleDependency(
      req.body,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.MODULE_DEPENDENCY.CREATED,
      data: dependency,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.MODULE_DEPENDENCY.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listModuleDependencies = async (req: Request, res: Response) => {
  try {
    const { dependencies, pagination } =
      await ModuleDependencyService.listModuleDependencies(
        req.query as PaginationQuery,
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.MODULE_DEPENDENCY.RETRIEVED,
      pagination: {
        currentCount: dependencies.length,
        ...pagination,
      },
      data: dependencies,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.MODULE_DEPENDENCY.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteModuleDependency = async (req: Request, res: Response) => {
  try {
    await ModuleDependencyService.deleteModuleDependency(req.params.id);

    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: Messages.MODULE_DEPENDENCY.DELETED });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.MODULE_DEPENDENCY.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
