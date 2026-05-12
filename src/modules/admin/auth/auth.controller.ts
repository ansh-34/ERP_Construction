import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { AuthService } from './auth.service.js';

const cookieOptions = {
  httpOnly: true,
};

const refreshCookieName = 'refreshToken';

const refreshCookieOptions = {
  httpOnly: true,
  path: '/api/domain/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

const getStringName = (name: unknown): string => {
  if (typeof name === 'string') return name;

  if (name && typeof name === 'object') {
    const record = name as Record<string, unknown>;
    const englishName = record.en;
    const firstStringValue = Object.values(record).find(
      (value): value is string => typeof value === 'string',
    );

    if (typeof englishName === 'string') return englishName;
    if (firstStringValue) return firstStringValue;
  }

  return '';
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

export const login = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.login(req.body);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.AUTH.LOGIN_SUCCESS,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      data: {
        id: result.user.id,
        name: getStringName(result.user.name),
        email: result.user.email,
        role: result.user.role.toUpperCase(),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.AUTH.LOGIN_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.body.refreshToken;
    const accessToken = getAccessTokenFromRequest(req);

    const result = await AuthService.refreshToken({
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
        data: result,
      });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.AUTH.LOGIN_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.body.refreshToken;

    await AuthService.logout({ refreshToken: token });

    return res
      .status(HttpStatus.OK)
      .clearCookie('accessToken')
      .clearCookie('refreshToken', { path: '/api' })
      .clearCookie('refreshToken', { path: '/api/domain/auth' })
      .clearCookie(refreshCookieName, { path: '/api/domain/auth' })
      .json({
        success: true,
        message: Messages.AUTH.LOGOUT_SUCCESS,
      });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.AUTH.LOGIN_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const data = await AuthService.forgotPassword(req.body);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PASSWORD_RESET.OTP_SENT,
      data,
    });
  } catch (error) {
    console.error('[Admin ForgotPassword]', error);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PASSWORD_RESET.OTP_SENT,
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    await AuthService.resetPassword(req.body);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PASSWORD_RESET.OTP_VERIFIED,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.PASSWORD_RESET.RESET_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    await AuthService.changePassword(req.user!.userId as string, req.body);

    return res
      .status(HttpStatus.OK)
      .clearCookie('accessToken')
      .clearCookie('refreshToken', { path: '/api' })
      .clearCookie('refreshToken', { path: '/api/domain/auth' })
      .clearCookie(refreshCookieName, { path: '/api/domain/auth' })
      .json({
        success: true,
        message: Messages.AUTH.CHANGE_PASSWORD_SUCCESS,
      });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.AUTH.LOGIN_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
