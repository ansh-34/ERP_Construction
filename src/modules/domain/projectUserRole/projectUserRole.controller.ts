import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { ProjectUserRoleService } from './projectUserRole.service.js';
import type { StatusEnum } from '../../../infra/database/prisma/generated/prisma/client/enums.js';

export const assign = async (req: Request, res: Response) => {
  try {
    const assignment = await ProjectUserRoleService.assign(
      req.user!.domainId,
      req.body as { projectId: string; userId: string; roleId: string },
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.PROJECT_USER_ROLE.CREATED,
      data: assignment,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PROJECT_USER_ROLE.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const { assignments, pagination } = await ProjectUserRoleService.list(
      req.user!.domainId,
      req.query as PaginationQuery & {
        projectId?: string;
        userId?: string;
        roleId?: string;
        status?: StatusEnum;
      },
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PROJECT_USER_ROLE.RETRIEVED,
      pagination: {
        currentCount: assignments.length,
        ...pagination,
      },
      data: assignments,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PROJECT_USER_ROLE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listByProject = async (req: Request, res: Response) => {
  try {
    const { assignments, pagination } =
      await ProjectUserRoleService.listByProject(
        req.user!.domainId,
        req.params.projectId,
        req.query as PaginationQuery,
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PROJECT_USER_ROLE.RETRIEVED,
      pagination: {
        currentCount: assignments.length,
        ...pagination,
      },
      data: assignments,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PROJECT_USER_ROLE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listByUser = async (req: Request, res: Response) => {
  try {
    const { assignments, pagination } = await ProjectUserRoleService.listByUser(
      req.user!.domainId,
      req.params.userId,
      req.query as PaginationQuery,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PROJECT_USER_ROLE.RETRIEVED,
      pagination: {
        currentCount: assignments.length,
        ...pagination,
      },
      data: assignments,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PROJECT_USER_ROLE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const assignment = await ProjectUserRoleService.getById(
      req.user!.domainId,
      req.params.id,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PROJECT_USER_ROLE.RETRIEVED,
      data: assignment,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PROJECT_USER_ROLE.NOT_FOUND;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const assignment = await ProjectUserRoleService.update(
      req.user!.domainId,
      req.params.id,
      req.body as { roleId?: string; status?: StatusEnum },
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PROJECT_USER_ROLE.UPDATED,
      data: assignment,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PROJECT_USER_ROLE.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const assignment = await ProjectUserRoleService.remove(
      req.user!.domainId,
      req.params.id,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PROJECT_USER_ROLE.DELETED,
      data: assignment,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PROJECT_USER_ROLE.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
