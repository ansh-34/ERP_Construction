import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { SuperAdminProfileService } from './profile.service.js';

const getTokenFromRequest = (req: Request): string | undefined => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    return req.headers.authorization.split(' ')[1];
  }

  return (
    (req.cookies?.accessToken as string | undefined) ||
    (req.cookies?.token as string | undefined)
  );
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication token required',
      });
    }

    const profile = await SuperAdminProfileService.getProfile(token);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Profile fetched successfully',
      data: profile,
    });
  } catch {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};
