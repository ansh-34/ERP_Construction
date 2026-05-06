import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../constants/index.js';
import { resolveHttpStatus } from '../../utils/httpError.js';
import { SharedRefreshService } from './refresh.service.js';

const cookieOptions = {
  httpOnly: true,
};

const getRefreshCookieOptions = (path: string) => ({
  httpOnly: true,
  path,
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

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

const createRefreshTokenController =
  (refreshCookiePath: string) => async (req: Request, res: Response) => {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;
      const accessToken = getAccessTokenFromRequest(req);

      const result = await SharedRefreshService.refreshToken({
        refreshToken: token,
        accessToken,
      });

      return res
        .status(HttpStatus.OK)
        .cookie('accessToken', result.accessToken, cookieOptions)
        .cookie(
          'refreshToken',
          result.refreshToken,
          getRefreshCookieOptions(refreshCookiePath),
        )
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

export const refreshToken = createRefreshTokenController('/api');
export const refreshDomainToken = createRefreshTokenController('/api');
export const refreshUserToken = createRefreshTokenController('/api');
