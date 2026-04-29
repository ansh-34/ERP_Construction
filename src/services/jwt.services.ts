import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { TokenPayload } from '../types/index.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const signToken = (
  payload: TokenPayload,
  expiresIn: string | number = '1d',
): string => {
  return jwt.sign(payload as object, JWT_SECRET, {
    expiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
