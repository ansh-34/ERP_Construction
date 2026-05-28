import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { UserListService } from './user.service.js';

export const listUsers = async (req: Request, res: Response) => {
  try {
    const { users, pagination } = await UserListService.listUsers(
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
