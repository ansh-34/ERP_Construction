import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { UserService } from './auth.service.js';

const cookieOptions = {
  httpOnly: true,
};

const refreshCookieOptions = {
  httpOnly: true,
  path: '/api/user/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export const verifyAndActivateUser = async (req: Request, res: Response) => {
  try {
    const data = req.query as { email: string; token: string };
    const result = await UserService.verifyAndActivateUser(data);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Account verified successfully',
      data: result,
    });
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
      .cookie('accessToken', result.accessToken, cookieOptions)
      .cookie('refreshToken', result.refreshToken, refreshCookieOptions)
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
      .cookie('accessToken', result.accessToken, cookieOptions)
      .cookie('refreshToken', result.refreshToken, refreshCookieOptions)
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

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;

    const result = await UserService.refreshToken({
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

    await UserService.logout({ refreshToken: token });

    return res
      .status(HttpStatus.OK)
      .clearCookie('accessToken')
      .clearCookie('refreshToken', { path: '/api/user/auth' })
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
    await UserService.forgotPassword(req.body);

    // Always return the same response to prevent email enumeration
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PASSWORD_RESET.OTP_SENT,
    });
  } catch (error) {
    // Swallow errors to avoid leaking info — log internally
    console.error('[User ForgotPassword]', error);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.PASSWORD_RESET.OTP_SENT,
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    await UserService.resetPassword(req.body);

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
    await UserService.changePassword(req.user!.userId as string, req.body);

    return res
      .status(HttpStatus.OK)
      .clearCookie('accessToken')
      .clearCookie('refreshToken', { path: '/api/user/auth' })
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
