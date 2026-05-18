export const DATABASE_UNAVAILABLE_MESSAGE = 'Service temporarily unavailable';

type PrismaErrorShape = {
  name?: string;
  code?: string;
  message?: string;
};

function isPrismaErrorShape(error: unknown): error is PrismaErrorShape {
  return typeof error === 'object' && error !== null;
}

export function normalizePrismaError(error: unknown): Error {
  if (error instanceof Error) {
    if (
      error.message === 'duplicate' ||
      error.message === 'duplicate code' ||
      error.message === 'duplicate url' ||
      error.message === 'invalid JSON' ||
      error.message === 'invalid json name' ||
      error.message === 'invalid json description' ||
      error.message === 'invalid numbers' ||
      error.message === 'invalid budget' ||
      error.message === 'invalid spent' ||
      error.message === 'invalid relation' ||
      error.message === 'invalid assignee' ||
      error.message === 'not found' ||
      error.message === 'request already actioned' ||
      error.message === 'empty update payload'
    ) {
      return error;
    }
  }

  if (isPrismaErrorShape(error)) {
    if (
      error.name === 'PrismaClientRustPanicError' ||
      error.name === 'PrismaClientInitializationError'
    ) {
      return new Error(DATABASE_UNAVAILABLE_MESSAGE);
    }

    if (
      error.code === 'P1000' ||
      error.code === 'P1001' ||
      error.code === 'P1002'
    ) {
      return new Error(DATABASE_UNAVAILABLE_MESSAGE);
    }

    if (error.code === 'P2002') {
      return new Error('duplicate');
    }

    if (error.code === 'P2003') {
      return new Error('invalid relation');
    }

    if (error.code === 'P2025') {
      return new Error('not found');
    }
  }

  return new Error('Something went wrong');
}
