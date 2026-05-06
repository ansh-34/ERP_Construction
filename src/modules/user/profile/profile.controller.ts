import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { UserProfileService } from './profile.service.js';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { userId, domainId } = req.user!;

    if (userId === domainId) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: 'Invalid token',
      });
    }

    const profile = await UserProfileService.getProfile(userId, domainId);

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
