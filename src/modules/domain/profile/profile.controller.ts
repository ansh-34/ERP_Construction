import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { DomainProfileService } from './profile.service.js';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { domainId } = req.user!;

    const profile = await DomainProfileService.getProfile(domainId);

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
