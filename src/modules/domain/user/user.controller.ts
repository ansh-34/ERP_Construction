import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { UserService } from './user.service.js';

const cookieOptions = {
  httpOnly: true,
};

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

export const verifyAndActivateUser = async (req: Request, res: Response) => {
  try {
    await UserService.verifyAndActivateUser(req.body);

    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: Messages.USER.ACCOUNT_SETUP_COMPLETE });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.USER.VERIFY_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await UserService.registerUser(
      req.user!.domainId as string,
      req.body,
    );

    return res
      .status(HttpStatus.CREATED)
      .cookie('token', result.token, cookieOptions)
      .json({
        success: true,
        message: Messages.USER.REGISTERED,
        data: {
          user: result.user,
          domain: result.domain,
        },
      });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.USER.REGISTRATION_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await UserService.loginUser(req.body);

    return res
      .status(HttpStatus.OK)
      .cookie('token', result.token, cookieOptions)
      .json({
        success: true,
        message: Messages.AUTH.LOGIN_SUCCESS,
        data: {
          user: result.user,
          domain: result.domain,
        },
      });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.AUTH.LOGIN_FAILED;
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
