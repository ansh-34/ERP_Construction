import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { SuperAdminAuthService } from './auth.service.js';
import { superadminLoginBodySchema } from './auth.validator.js';
const cookieOptions = {
  httpOnly: true,
};

export const loginSuperadmin = async (req: Request, res: Response) => {
  try {
    const parsed = superadminLoginBodySchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((err) => err.message).join(', ');
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message });
    }
    const token = await SuperAdminAuthService.login(parsed.data);

    return res
      .status(HttpStatus.OK)
      .cookie('token', token, cookieOptions)
      .json({ success: true, message: Messages.AUTH.SUPERADMIN_VERIFIED });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.COMMON.INTERNAL_SERVER_ERROR;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
