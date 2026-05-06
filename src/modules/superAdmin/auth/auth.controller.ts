import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { SuperAdminAuthService } from './auth.service.js';
const cookieOptions = {
  httpOnly: true,
};

const refreshCookieName = 'refreshToken';

const refreshCookieOptions = {
  httpOnly: true,
  path: '/api/superadmin/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const getAccessTokenFromRequest = (req: Request): string | undefined => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    return req.headers.authorization.split(' ')[1];
  }

  return (
    (req.body.accessToken as string | undefined) ||
    (req.cookies?.accessToken as string | undefined)
  );
};

export const loginSuperAdmin = async (req: Request, res: Response) => {
  try {
    const result = await SuperAdminAuthService.login(req.body);

    return res
      .status(HttpStatus.OK)
      .clearCookie('refreshToken', { path: '/api' })
      .cookie('accessToken', result.accessToken, cookieOptions)
      .cookie(refreshCookieName, result.refreshToken, refreshCookieOptions)
      .json({
        success: true,
        message: Messages.AUTH.SUPERADMIN_VERIFIED,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        data: result.user,
      });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.COMMON.INTERNAL_SERVER_ERROR;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.body.refreshToken || req.cookies?.[refreshCookieName];
    const accessToken = getAccessTokenFromRequest(req);

    const result = await SuperAdminAuthService.refreshToken({
      refreshToken: token,
      accessToken,
    });

    return res
      .status(HttpStatus.OK)
      .clearCookie('refreshToken', { path: '/api' })
      .cookie('accessToken', result.accessToken, cookieOptions)
      .cookie(refreshCookieName, result.refreshToken, refreshCookieOptions)
      .json({
        success: true,
        message: Messages.AUTH.REFRESH_TOKEN_SUCCESS,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        data: result.user,
      });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.COMMON.INTERNAL_SERVER_ERROR;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
