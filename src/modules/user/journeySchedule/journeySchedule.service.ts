import { Messages } from '../../../constants/index.js';
import {
  JourneyScheduleRepository,
  VehicleRepository,
} from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const JourneyScheduleService = {
  async getStats(domainId: string) {
    return JourneyScheduleRepository.getStats(domainId);
  },

  async generateCode(domainId: string, truckId: string): Promise<string> {
    let attempts = 0;
    while (attempts < 10) {
      const now = new Date();
      const pad = (n: number, len = 2) => String(n).padStart(len, '0');
      const day = pad(now.getDate());
      const month = pad(now.getMonth() + 1);
      const year = now.getFullYear();
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const seconds = pad(now.getSeconds());

      const code = `VJS-${day}${month}${year}${hours}${minutes}${seconds}`;

      const existing = await JourneyScheduleRepository.findDuplicateForVehicle(
        code,
        domainId,
        truckId,
      );
      if (!existing) {
        return code;
      }
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error('Failed to generate unique vehicle journey schedule code');
  },

  async createJourneySchedule(
    domainId: string,
    data: {
      truckId: string;
      description?: string;
      date: string;
      driverName: string;
      startLocation: string;
      endLocation: string;
      distance: number;
      average: number;
      expectedFuelValue: number;
      fuelAlertThreshold: number;
      loadedQuantity: number;
      loadedQuantityUomId: string;
      loadedAt: string;
      loadingStatus: string;
    },
  ) {
    const {
      truckId,
      description,
      date,
      driverName,
      startLocation,
      endLocation,
      distance,
      average,
      expectedFuelValue,
      fuelAlertThreshold,
      loadedQuantity,
      loadedQuantityUomId,
      loadedAt,
      loadingStatus,
    } = data;

    if (!truckId) {
      throw new Error(Messages.JOURNEY_SCHEDULE.TRUCK_CODE_REQUIRED);
    }

    // Validate parent Vehicle exists
    const vehicle = await VehicleRepository.findActiveByIdAndDomain(
      truckId,
      domainId,
    );

    if (!vehicle) {
      throw new Error(Messages.VEHICLE.NOT_FOUND_IN_DOMAIN);
    }

    // Generate code
    const code = await JourneyScheduleService.generateCode(domainId, truckId);

    // Check duplicate
    const existing = await JourneyScheduleRepository.findDuplicateForVehicle(
      code,
      domainId,
      truckId,
    );

    if (existing) {
      throw new Error(Messages.JOURNEY_SCHEDULE.DUPLICATE_FOR_VEHICLE);
    }
    return JourneyScheduleRepository.create({
      truckId,
      code,
      description: description || null,
      date: new Date(date),
      driverName,
      startLocation,
      endLocation,
      distance,
      average,
      expectedFuelValue,
      fuelAlertThreshold,
      loadedQuantity,
      loadedQuantityUomId,
      loadedAt: new Date(loadedAt),
      loadingStatus,
      domainId,
    });
  },

  async listJourneySchedules(domainId: string, query: PaginationQuery) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, schedules] =
      await JourneyScheduleRepository.listByDomain(domainId, limit, offset);

    return {
      schedules,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async deleteJourneySchedule(domainId: string, id: string) {
    const schedule = await JourneyScheduleRepository.findActiveByIdAndDomain(
      id,
      domainId,
    );
    if (!schedule) {
      throw new Error(Messages.JOURNEY_SCHEDULE.NOT_FOUND);
    }
    return JourneyScheduleRepository.softDelete(id);
  },
};
