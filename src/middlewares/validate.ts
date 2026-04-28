import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { HttpStatus, Messages } from '@constants/index';

export const validate =
  (schema: ZodSchema, property: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
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
