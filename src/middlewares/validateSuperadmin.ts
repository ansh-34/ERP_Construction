import type { Request, Response, NextFunction } from 'express';
import prisma from '../infra/database/prisma/prisma.client.js';
import jwt from 'jsonwebtoken';

const validateSuperadmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token =
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : req.cookies.token;
    if (!token) {
      res.status(401).json({
        success: false,
        message:
          'Superadmin credentials (email and password) are required for this action.',
      });
      return;
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };
    const superadmin = await prisma.superadmin.findFirst({
      where: {
        id: decodedToken.id,
        email: decodedToken.email,
        isDeleted: false,
      },
    });

    if (!superadmin) {
      res.status(401).json({
        success: false,
        message: 'Invalid Superadmin credentials.',
      });
      return;
    }
    // Success - move to the controller
    next();
  } catch (err) {
    console.error('validateSuperadmin middleware error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default validateSuperadmin;
