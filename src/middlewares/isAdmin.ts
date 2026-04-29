import type { Request, Response, NextFunction } from 'express';
import prisma from '../infra/database/prisma/prisma.client.js';

const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (req.user.roleId) {
      const role = await prisma.role.findUnique({
        where: { id: req.user.roleId },
      });
      if (role && role.code === 'admin') {
        return next();
      }
    }

    res.status(403).json({
      success: false,
      message: 'Forbidden: Only Administrators can perform this action.',
    });
  } catch (err) {
    console.error('isAdmin middleware error:', err);
    res
      .status(500)
      .json({ success: false, message: 'Server error during authorization' });
  }
};

export default isAdmin;
