import { Messages } from '../../../constants/index.js';
import {
  JourneyScheduleRepository,
  VehicleRepository,
} from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const JourneyScheduleService = {
  async createJourneySchedule(
    domainId: string,
    data: {
      truckId: string;
      code: string;
      description?: string;
      date?: string;
      driverName?: string;
      startLocation?: string;
      endLocation?: string;
      distance?: number;
      average?: number;
      expectedFuelValue?: number;
      fuelAlertThreshold?: number;
      loadedQuantity?: number;
      loadedQuantityUomId?: string;
      loadedAt?: string;
      loadingStatus?: string;
    },
  ) {
    const {
      truckId,
      code,
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

    if (!truckId || !code) {
      throw new Error(Messages.JOURNEY_SCHEDULE.TRUCK_CODE_REQUIRED);
    }

    const vehicle = await VehicleRepository.findActiveByIdAndDomain(
      truckId,
      domainId,
    );

    if (!vehicle) {
      throw new Error(Messages.VEHICLE.NOT_FOUND_IN_DOMAIN);
    }

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
      date: date ? new Date(date) : null,
      driverName: driverName || null,
      startLocation: startLocation || null,
      endLocation: endLocation || null,
      distance: distance ?? 0,
      average: average ?? 0,
      expectedFuelValue: expectedFuelValue ?? 0,
      fuelAlertThreshold: fuelAlertThreshold ?? 0,
      loadedQuantity: loadedQuantity ?? 0,
      loadedQuantityUomId: loadedQuantityUomId || null,
      loadedAt: loadedAt ? new Date(loadedAt) : null,
      loadingStatus: loadingStatus ?? 'PENDING',
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
};
