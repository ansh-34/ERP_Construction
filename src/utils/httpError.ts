import { HttpStatus } from '@constants/httpStatus';
import { DATABASE_UNAVAILABLE_MESSAGE } from '@/utils/prismaError';

export function resolveHttpStatus(message: string): HttpStatus {
  if (message === DATABASE_UNAVAILABLE_MESSAGE) {
    return HttpStatus.SERVICE_UNAVAILABLE;
  }

  if (message === 'Database schema is not migrated') {
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  if (message === 'not found' || message.toLowerCase().includes('not found')) {
    return HttpStatus.NOT_FOUND;
  }

  if (message === 'Email verification is required') {
    return HttpStatus.FORBIDDEN;
  }

  if (message === 'unauthorized') {
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

  // Auth/credential related errors
  if (
    message.includes('Invalid credentials') ||
    message.includes('Invalid or expired verification link') ||
    message.includes('Invalid or expired') ||
    message.includes('Email verification is required')
  ) {
    return HttpStatus.BAD_REQUEST;
  }

  // Missing required fields
  if (
    message.includes('is required') ||
    message.includes('already exists') ||
    message.includes('not generated yet') ||
    message === 'task not completed' ||
    message.includes('does not match') ||
    message.includes('cannot be') ||
    message.includes('must be after') ||
    message.includes('must be greater than') ||
    message.includes('must contain') ||
    message.includes('must equal') ||
    message.includes('Only pending') ||
    message.includes('already approved') ||
    message.includes('already created') ||
    message.includes('already been posted') ||
    message.includes('already been reversed') ||
    message.includes('already closed') ||
    message.includes('overlap') ||
    message.includes('must be inside') ||
    message.includes('not generated yet') ||
    message === 'request already actioned'
  ) {
    return HttpStatus.BAD_REQUEST;
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

  // Domain-scoped validation errors (e.g. language/currency not offered by the
  // domain, no languages configured) are client errors, not server errors.
  if (
    message.includes('belong to your domain') ||
    message.includes('configured for your domain')
  ) {
    return HttpStatus.BAD_REQUEST;
  }

  return HttpStatus.INTERNAL_SERVER_ERROR;
}
