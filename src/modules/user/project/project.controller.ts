import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { UserProjectService } from './project.service.js';

export const createProject = async (req: Request, res: Response) => {
  try {
    const project = await UserProjectService.createProject(
      req.user!.domainId,
      req.body,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.USER_PROJECT.CREATED,
      data: project,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.USER_PROJECT.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listDomainProjects = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const { projects, pagination } =
      await UserProjectService.listDomainProjects(
        req.user!.domainId,
        req.query as PaginationQuery,
        language as string,
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.USER_PROJECT.RETRIEVED,
      pagination: {
        currentCount: projects.length,
        ...pagination,
      },
      data: projects,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.USER_PROJECT.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getMyProjects = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const { projects, pagination } = await UserProjectService.getMyProjects(
      req.user!.domainId,
      req.user!.userId,
      req.query as PaginationQuery,
      language as string,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.USER_PROJECT.RETRIEVED,
      pagination: {
        currentCount: projects.length,
        ...pagination,
      },
      data: projects,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.USER_PROJECT.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { language } = req.headers;
    const project = await UserProjectService.getProjectById(
      req.user!.domainId,
      req.params.id,
      language as string | null,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.USER_PROJECT.RETRIEVED,
      data: project,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.USER_PROJECT.NOT_FOUND;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const project = await UserProjectService.updateProject(
      req.user!.domainId,
      req.params.id,
      req.body,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.USER_PROJECT.UPDATED,
      data: project,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.USER_PROJECT.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    await UserProjectService.deleteProject(req.user!.domainId, req.params.id);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.USER_PROJECT.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.USER_PROJECT.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
