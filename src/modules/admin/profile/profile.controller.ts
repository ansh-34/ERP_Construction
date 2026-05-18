import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { AdminProfileService } from './profile.service.js';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.userId;

    const profile = await AdminProfileService.getProfile(adminId);

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
