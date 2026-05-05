import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { AuthService } from './auth.service.js';

const cookieOptions = {
  httpOnly: true,
};

const refreshCookieOptions = {
  httpOnly: true,
  path: '/api/domain/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.login(req.body);

    return res
      .status(HttpStatus.OK)
      .cookie('accessToken', result.accessToken, cookieOptions)
      .cookie('refreshToken', result.refreshToken, refreshCookieOptions)
      .json({
        success: true,
        message: Messages.AUTH.LOGIN_SUCCESS,
        data: result,
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
    const token = req.body.refreshToken || req.cookies?.refreshToken;

    const result = await AuthService.refreshToken({
      refreshToken: token,
    });

    return res
      .status(HttpStatus.OK)
      .cookie('accessToken', result.accessToken, cookieOptions)
      .cookie('refreshToken', result.refreshToken, refreshCookieOptions)
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
    const token = req.body.refreshToken || req.cookies?.refreshToken;

    await AuthService.logout({ refreshToken: token });

    return res
      .status(HttpStatus.OK)
      .clearCookie('accessToken')
      .clearCookie('refreshToken', { path: '/api/domain/auth' })
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
    await AuthService.forgotPassword(req.body);

    // Always return the same response to prevent email enumeration
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PASSWORD_RESET.OTP_SENT,
    });
  } catch (error) {
    // Swallow errors to avoid leaking info — log internally
    console.error('[Domain ForgotPassword]', error);
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
    await AuthService.changePassword(req.user!.domainId as string, req.body);

    return res
      .status(HttpStatus.OK)
      .clearCookie('accessToken')
      .clearCookie('refreshToken', { path: '/api/domain/auth' })
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
