import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { SuperAdminAuthService } from './auth.service.js';
const cookieOptions = {
  httpOnly: true,
};

export const loginSuperAdmin = async (req: Request, res: Response) => {
  try {
    const result = await SuperAdminAuthService.login(req.body);

    return res
      .status(HttpStatus.OK)
      .cookie('accessToken', result.accessToken, cookieOptions)
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
