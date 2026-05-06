import jwt from 'jsonwebtoken';
import variables from '@/config/variables.config';
import type { TokenPayload } from '@/types/index';

const JWT_SECRET = variables.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const encode = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: variables.JWT_EXPIRY,
  } as jwt.SignOptions);
};

export const decode = (token: string): string | jwt.JwtPayload => {
  return jwt.verify(token, JWT_SECRET);
};

export const signToken = (
  payload: TokenPayload,
  expiresIn: string | number = variables.JWT_EXPIRY,
): string => {
  return jwt.sign(payload as object, JWT_SECRET, {
    expiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
