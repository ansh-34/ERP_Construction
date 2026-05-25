import {
  machineReadingRepository,
  projectRepository,
  type MachineReadingRecord,
  type UpdateMachineReadingInput as RepositoryUpdateMachineReadingInput,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { generateCode } from '@/utils/code';
import { normalizePrismaError } from '@/utils/prismaError';
import {
  isNonEmptyString,
  isNonNegativeFiniteNumber,
} from '@/utils/validation';

export interface CreateMachineReadingInput {
  date: string;
  refillFuelStock?: number | string;
  fuelRefillQuantity?: number;
  machineStartTime: string;
  projectId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateMachineReadingInput {
  closingFuelStock: number;
  fuelRefillQuantity?: number;
  machineEndTime: string;
  status?: StatusEnum;
}

export interface EndMachineReadingInput {
  machineEndTime: string;
}

function buildMachineReadingSearchText(...values: unknown[]): string {
  return values
    .filter((value) => value !== undefined && value !== null)
    .join(' ')
    .toLowerCase();
}

function parseOptionalNumber(
  value: number | string | undefined,
  field: string,
): number {
  if (value === undefined || value === '') {
    return 0;
  }

  const numericValue = typeof value === 'number' ? value : Number(value);

  if (!isNonNegativeFiniteNumber(numericValue)) {
    throw new Error(`invalid ${field}`);
  }

  return numericValue;
}

function parseDate(value: string, field: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`invalid ${field}`);
  }

  return date;
}

function parseTime(value: string, field: string): Date {
  const normalizedValue = value.trim();
  const match = normalizedValue.match(
    /^(?<hours>[0-2]\d):(?<minutes>[0-5]\d)(?::(?<seconds>[0-5]\d)(?:\.(?<milliseconds>\d{1,3}))?)?$/,
  );

  if (!match?.groups) {
    throw new Error(`invalid ${field}`);
  }

  const hours = Number(match.groups.hours);
  const minutes = Number(match.groups.minutes);
  const seconds = Number(match.groups.seconds ?? '0');
  const milliseconds = Number(
    (match.groups.milliseconds ?? '0').padEnd(3, '0'),
  );

  if (hours > 23) {
    throw new Error(`invalid ${field}`);
  }

  return new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds, milliseconds));
}

function calculateHoursRun(startTime: Date, endTime: Date): number {
  let durationInMilliseconds = endTime.getTime() - startTime.getTime();

  if (durationInMilliseconds < 0) {
    durationInMilliseconds += 24 * 60 * 60 * 1000;
  }

  return Number((durationInMilliseconds / 3_600_000).toFixed(2));
}

function assertStatus(status: StatusEnum | undefined): void {
  if (
    status !== undefined &&
    status !== StatusEnum.ACTIVE &&
    status !== StatusEnum.INACTIVE
  ) {
    throw new Error('invalid status');
  }
}

function assertCreateInput(data: CreateMachineReadingInput): void {
  if (!isNonEmptyString(data.date)) {
    throw new Error('invalid date');
  }

  parseOptionalNumber(data.refillFuelStock, 'refillFuelStock');

  if (
    data.fuelRefillQuantity !== undefined &&
    !isNonNegativeFiniteNumber(data.fuelRefillQuantity)
  ) {
    throw new Error('invalid fuelRefillQuantity');
  }

  if (!isNonEmptyString(data.machineStartTime)) {
    throw new Error('invalid machineStartTime');
  }

  if (!isNonEmptyString(data.projectId)) {
    throw new Error('invalid projectId');
  }

  if (!isNonEmptyString(data.domainId)) {
    throw new Error('invalid domainId');
  }

  if (!isNonEmptyString(data.adminId)) {
    throw new Error('invalid adminId');
  }

  assertStatus(data.status);
}

function assertUpdateInput(data: UpdateMachineReadingInput): void {
  if (!isNonNegativeFiniteNumber(data.closingFuelStock)) {
    throw new Error('invalid closingFuelStock');
  }

  if (
    data.fuelRefillQuantity !== undefined &&
    !isNonNegativeFiniteNumber(data.fuelRefillQuantity)
  ) {
    throw new Error('invalid fuelRefillQuantity');
  }

  if (!isNonEmptyString(data.machineEndTime)) {
    throw new Error('invalid machineEndTime');
  }

  assertStatus(data.status);
}

function buildCreatePayload(data: CreateMachineReadingInput) {
  const refillFuelStock = parseOptionalNumber(
    data.refillFuelStock,
    'refillFuelStock',
  );

  return {
    date: parseDate(data.date, 'date'),
    searchText: buildMachineReadingSearchText(data.date),
    refillFuelStock,
    closingFuelStock: null,
    fuelRefillQuantity: data.fuelRefillQuantity ?? null,
    hoursRun: 0,
    machineStartTime: parseTime(data.machineStartTime, 'machineStartTime'),
    machineEndTime: null,
    projectId: data.projectId,
    domainId: data.domainId,
    adminId: data.adminId,
    status: data.status,
  };
}

function buildEndPayload(
  existingMachineReading: MachineReadingRecord,
  data: EndMachineReadingInput,
): RepositoryUpdateMachineReadingInput {
  const machineEndTime = parseTime(data.machineEndTime, 'machineEndTime');

  return {
    machineEndTime,
    hoursRun: calculateHoursRun(
      existingMachineReading.machineStartTime,
      machineEndTime,
    ),
  };
}

function buildUpdatePayload(
  existingMachineReading: MachineReadingRecord,
  data: UpdateMachineReadingInput,
): RepositoryUpdateMachineReadingInput {
  const machineEndTime = parseTime(data.machineEndTime, 'machineEndTime');

  return {
    closingFuelStock: data.closingFuelStock,
    ...(data.fuelRefillQuantity !== undefined && {
      fuelRefillQuantity: data.fuelRefillQuantity,
    }),
    machineEndTime,
    hoursRun: calculateHoursRun(
      existingMachineReading.machineStartTime,
      machineEndTime,
    ),
    ...(data.status !== undefined && { status: data.status }),
  };
}

export const machineReadingService = {
  create: async (
    data: CreateMachineReadingInput,
  ): Promise<MachineReadingRecord> => {
    assertCreateInput(data);

    try {
      const project = await projectRepository.findById(
        data.projectId,
        data.domainId,
        data.adminId,
      );

      if (!project) {
        throw new Error('not found');
      }

      let code = generateCode('MACHINE_READING');

      while (
        await machineReadingRepository.findByCode(
          code,
          data.domainId,
          data.projectId,
          data.adminId,
        )
      ) {
        code = generateCode('MACHINE_READING');
      }

      return await machineReadingRepository.create({
        ...buildCreatePayload(data),
        code,
        searchText: buildMachineReadingSearchText(code, data.date),
      });
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    adminId: string,
    projectId?: string,
    searchKey?: string,
  ): Promise<MachineReadingRecord[]> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    if (projectId !== undefined && !isNonEmptyString(projectId)) {
      throw new Error('invalid projectId');
    }

    try {
      return await machineReadingRepository.findMany(
        domainId,
        adminId,
        projectId,
        searchKey,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<MachineReadingRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    try {
      return await machineReadingRepository.findById(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateMachineReadingInput,
  ): Promise<MachineReadingRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    assertUpdateInput(data);

    try {
      const existingMachineReading = await machineReadingRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingMachineReading) {
        throw new Error('not found');
      }

      return await machineReadingRepository.update(
        id,
        domainId,
        buildUpdatePayload(existingMachineReading, data),
        adminId,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  end: async (
    id: string,
    domainId: string,
    adminId: string,
    data: EndMachineReadingInput,
  ): Promise<MachineReadingRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    if (!isNonEmptyString(data.machineEndTime)) {
      throw new Error('invalid machineEndTime');
    }

    try {
      const existingMachineReading = await machineReadingRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingMachineReading) {
        throw new Error('not found');
      }

      return await machineReadingRepository.update(
        id,
        domainId,
        buildEndPayload(existingMachineReading, data),
        adminId,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
