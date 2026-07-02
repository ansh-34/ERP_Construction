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
      error.message === 'invalid ids' ||
      error.message === 'invalid date' ||
      error.message === 'invalid code' ||
      error.message === 'invalid closing actor' ||
      error.message === 'duplicate voucher number' ||
      error.message === 'Journal entry not found' ||
      error.message === 'Fiscal year not found' ||
      error.message === 'Accounting period not found' ||
      error.message === 'Currency not found' ||
      error.message === 'Project not found' ||
      error.message === 'Cost center not found' ||
      error.message === 'Vendor not found' ||
      error.message === 'Customer not found' ||
      error.message === 'Transaction date must be inside the fiscal year' ||
      error.message === 'Posting date must be inside the accounting period' ||
      error.message === 'DRAFT journal entry not found' ||
      error.message === 'POSTED journal entry not found' ||
      error.message === 'Journal entry cannot post to a closed fiscal year' ||
      error.message ===
        'Journal entry cannot post to a closed or invalid accounting period' ||
      error.message ===
        'Journal entry must contain at least two active lines' ||
      error.message === 'Journal entry must contain at least one active line' ||
      error.message === 'Journal entry contains an invalid posting account' ||
      error.message ===
        'Each journal line must contain either debit or credit' ||
      error.message === 'Journal entry total debit must equal total credit' ||
      error.message === 'Journal entry has already created ledger entries' ||
      error.message === 'Journal entry has already been posted' ||
      error.message === 'Journal entry has already been reversed' ||
      error.message === 'invalid domainId' ||
      error.message === 'invalid adminId' ||
      error.message === 'invalid machineId' ||
      error.message === 'invalid uomId' ||
      error.message === 'invalid quantity' ||
      error.message === 'invalid transactionType' ||
      error.message === 'invalid userTypeCode' ||
      error.message === 'invalid system user type code' ||
      error.message === 'invalid domainUserTypeCode' ||
      error.message === 'user type not found' ||
      error.message === 'user type code already exists' ||
      error.message === 'user type does not belong to domain industry' ||
      error.message === 'one or more user types not found' ||
      error.message ===
        'one or more user types already mapped to this domain' ||
      error.message === 'user type already mapped to this domain' ||
      error.message === 'not found' ||
      error.message === 'unauthorized' ||
      error.message === 'task not completed' ||
      error.message === 'task plannedEndDate is required' ||
      error.message === 'request already actioned' ||
      error.message === 'empty update payload' ||
      error.message === 'Fiscal year name already exists' ||
      error.message === 'Fiscal year dates overlap an existing fiscal year' ||
      error.message === 'Fiscal year is already closed' ||
      error.message === 'Accounting period name already exists' ||
      error.message === 'Accounting period number already exists' ||
      error.message === 'Accounting period dates overlap an existing period' ||
      error.message ===
        'Accounting period dates must be inside the fiscal year' ||
      error.message === 'Accounting period is already closed' ||
      error.message === 'Machinery inventory not found' ||
      error.message === 'Insufficient machinery inventory quantity' ||
      error.message === 'endDateTime must be after startDateTime' ||
      error.message ===
        'endMeterReading must be greater than startMeterReading' ||
      error.message.includes('cannot be')
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

    if (error.code === 'P2021' || error.code === 'P2022') {
      return new Error('Database schema is not migrated');
    }

    if (error.code === 'P2025') {
      return new Error('not found');
    }
  }

  return new Error('Something went wrong');
}
