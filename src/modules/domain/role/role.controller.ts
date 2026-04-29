import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { RoleService } from './role.service.js';
import { createRoleBodySchema } from './role.validator.js';

export const createRole = async (req: Request, res: Response) => {
  try {
    const parsed = createRoleBodySchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((err) => err.message).join(', ');
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message });
    }

    const role = await RoleService.createRole(
      req.user!.domainId,
      parsed.data as { name: any; code: string; level?: number },
    );

    return res
      .status(HttpStatus.CREATED)
      .json({ success: true, message: Messages.ROLE.CREATED, data: role });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.ROLE.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const assignPermissions = async (req: Request, res: Response) => {
  try {
    const record = await RoleService.assignPermissions(
      req.user!.domainId,
      req.params.roleId,
      req.body as { moduleId: string; permissions: string[] },
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ROLE.PERMISSIONS_ASSIGNED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.ROLE.ASSIGN_PERMISSIONS_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listRoles = async (req: Request, res: Response) => {
  try {
    const { roles, pagination } = await RoleService.listRoles(
      req.user!.domainId,
      req.query as PaginationQuery,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ROLE.RETRIEVED,
      pagination: {
        currentCount: roles.length,
        ...pagination,
      },
      data: roles,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.ROLE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const assignRole = async (req: Request, res: Response) => {
  try {
    const updated = await RoleService.assignRole(
      req.user!.domainId,
      req.params.id,
      req.body,
    );

    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: Messages.ROLE.ASSIGNED, data: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.ROLE.ASSIGN_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
