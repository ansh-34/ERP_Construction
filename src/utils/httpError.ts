import { HttpStatus } from '@constants/httpStatus';
import { DATABASE_UNAVAILABLE_MESSAGE } from '@/utils/prismaError';

export function resolveHttpStatus(message: string): HttpStatus {
  if (message === DATABASE_UNAVAILABLE_MESSAGE) {
    return HttpStatus.SERVICE_UNAVAILABLE;
  }

  if (message === 'not found') {
    return HttpStatus.NOT_FOUND;
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
