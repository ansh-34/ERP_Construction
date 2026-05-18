import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { HttpStatus, Messages } from '../constants/index.js';

export const validate =
  (schema: ZodSchema, property: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const payload = req[property];

    if (
      req.user &&
      payload &&
      typeof payload === 'object' &&
      (property === 'body' || property === 'query')
    ) {
      if (req.user.domainId) {
        Object.assign(payload, { domainId: req.user.domainId });
      }

      if (req.user.adminId) {
        Object.assign(payload, { adminId: req.user.adminId });
      }
    }

    const result = schema.safeParse(req[property]);

    if (!result.success) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: Messages.COMMON.BAD_REQUEST,
        errors: result.error.format(),
      });
    }

    Object.assign(req[property], result.data);
    next();
  };
