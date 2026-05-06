import { HttpStatus } from '@constants/httpStatus';
import { DATABASE_UNAVAILABLE_MESSAGE } from '@/utils/prismaError';

export function resolveHttpStatus(message: string): HttpStatus {
  if (message === DATABASE_UNAVAILABLE_MESSAGE) {
    return HttpStatus.SERVICE_UNAVAILABLE;
  }

  if (message === 'not found') {
    return HttpStatus.NOT_FOUND;
  }

  if (message === 'Email verification is required') {
    return HttpStatus.FORBIDDEN;
  }

  if (message.includes('Too many failed attempts')) {
    return HttpStatus.TOO_MANY_REQUESTS;
  }

  if (message.includes('invalid or expired OTP')) {
    return HttpStatus.UNAUTHORIZED;
  }

  if (message.includes('invalid or expired refresh token')) {
    return HttpStatus.UNAUTHORIZED;
  }

  if (message.includes('OTP has expired')) {
    return HttpStatus.BAD_REQUEST;
  }

  if (message.includes('Password must be at least')) {
    return HttpStatus.UNPROCESSABLE_ENTITY;
  }

  if (
    message.includes('invalid') ||
    message.includes('duplicate') ||
    message === 'invalid relation' ||
    message === 'empty update payload'
  ) {
    return message.includes('duplicate')
      ? HttpStatus.CONFLICT
      : HttpStatus.BAD_REQUEST;
  }

  return HttpStatus.INTERNAL_SERVER_ERROR;
}
