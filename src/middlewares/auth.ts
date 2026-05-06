import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/jwt.services.js';

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accesstoken) {
    token = req.cookies.accesstoken as string;
  }

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: 'Authentication token required' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      domainId: decoded.domainId,
      roleId: decoded.roleId,
      industry: decoded.industry,
    };
    next();
  } catch {
    res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
