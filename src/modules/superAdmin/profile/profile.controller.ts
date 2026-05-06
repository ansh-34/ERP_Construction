import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { SuperAdminProfileService } from './profile.service.js';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userInfo = req.user!;
    const profile = await SuperAdminProfileService.getProfile(userInfo);

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
