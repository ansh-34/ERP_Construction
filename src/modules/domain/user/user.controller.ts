import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { UserService } from './user.service.js';

const getBaseUrl = (req: Request) => `${req.protocol}://${req.get('host')}`;

export const inviteUser = async (req: Request, res: Response) => {
  try {
    await UserService.inviteUser(req.user!.domainId, req.body, getBaseUrl(req));

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.USER.INVITED,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.USER.INVITE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listUsers = async (req: Request, res: Response) => {
  try {
    const { users, pagination } = await UserService.listUsers(
      req.user!.domainId,
      req.query as PaginationQuery,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.USER.RETRIEVED,
      pagination: {
        currentCount: users.length,
        ...pagination,
      },
      data: users,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.USER.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
