import type { Request, Response, NextFunction } from 'express';
import prisma from '../infra/database/prisma/prisma.client.js';

const isDomain = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (req.user) {
      const [isValidDomain, isValidAdmin] = await Promise.all([
        prisma.domain
          .count({
            where: {
              id: req.user.userId,
              adminId: req.user.adminId,
              isDeleted: false,
              status: 'ACTIVE',
            },
          })
          .then((count) => count > 0),
        prisma.admin
          .count({
            where: {
              id: req.user.adminId,
              isDeleted: false,
              status: 'ACTIVE',
            },
          })
          .then((count) => count > 0),
      ]);
      if (isValidDomain && isValidAdmin) {
        return next();
      }
    }

    res.status(403).json({
      success: false,
      message: 'Forbidden: Only Domain can perform this action.',
    });
  } catch (err) {
    console.error('isDomain middleware error:', err);
    res
      .status(500)
      .json({ success: false, message: 'Server error during authorization' });
  }
};

export default isDomain;
