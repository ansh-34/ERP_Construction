import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { AuthService } from './auth.service.js';

const cookieOptions = {
  httpOnly: true,
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.login(req.body);

    return res
      .status(HttpStatus.OK)
      .cookie('accessToken', result.accessToken, cookieOptions)
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
