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

  return HttpStatus.INTERNAL_SERVER_ERROR;
}
