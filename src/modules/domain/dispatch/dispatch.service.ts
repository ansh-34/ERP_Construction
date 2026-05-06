import { Messages } from '../../../constants/index.js';
import {
  DispatchRepository,
  JourneyScheduleRepository,
  VehicleRepository,
} from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const DispatchService = {
  async getStats(domainId: string) {
    return DispatchRepository.getStats(domainId);
  },

  async createDispatch(
    domainId: string,
    data: {
      vehicleId: string;
      code: string;
      journeyScheduleId?: string;
      description?: string;
      date?: string;
      driverName?: string;
      startLocation?: string;
      endLocation?: string;
      distance?: number;
      average?: number;
      expectedFuelValue?: number;
      actualFuelValue?: number;
      fuelAlertThreshold?: number;
      loadedQuantity?: number;
      loadedQuantityUomId?: string;
      loadedAt?: string;
      loadingStatus?: string;
      journeyStatus?: string;
    },
  ) {
    const {
      vehicleId,
      code,
      journeyScheduleId,
      description,
      date,
      driverName,
      startLocation,
      endLocation,
      distance,
      average,
      expectedFuelValue,
      actualFuelValue,
      fuelAlertThreshold,
      loadedQuantity,
      loadedQuantityUomId,
      loadedAt,
      loadingStatus,
      journeyStatus,
    } = data;

    if (!vehicleId || !code) {
      throw new Error(Messages.DISPATCH.VEHICLE_CODE_REQUIRED);
    }

    const vehicle = await VehicleRepository.findActiveByIdAndDomain(
      vehicleId,
      domainId,
    );

    if (!vehicle) {
      throw new Error(Messages.VEHICLE.NOT_FOUND_IN_DOMAIN);
    }

    if (journeyScheduleId) {
      const schedule = await JourneyScheduleRepository.findActiveByIdAndDomain(
        journeyScheduleId,
        domainId,
      );

      if (!schedule) {
        throw new Error(Messages.JOURNEY_SCHEDULE.NOT_FOUND);
      }
    }

    const existing = await DispatchRepository.findDuplicateForVehicle(
      code,
      domainId,
      vehicleId,
    );

    if (existing) {
      throw new Error(Messages.DISPATCH.DUPLICATE_FOR_VEHICLE);
    }

    return DispatchRepository.create({
      vehicleId,
      code,
      journeyScheduleId: journeyScheduleId || null,
      description: description || null,
      date: date ? new Date(date) : null,
      driverName: driverName || null,
      startLocation: startLocation || null,
      endLocation: endLocation || null,
      distance: distance ?? 0,
      average: average ?? 0,
      expectedFuelValue: expectedFuelValue ?? 0,
      actualFuelValue: actualFuelValue ?? 0,
      fuelAlertThreshold: fuelAlertThreshold ?? 0,
      loadedQuantity: loadedQuantity ?? 0,
      loadedQuantityUomId: loadedQuantityUomId || null,
      loadedAt: loadedAt ? new Date(loadedAt) : null,
      loadingStatus: loadingStatus ?? 'PENDING',
      journeyStatus: journeyStatus ?? 'SCHEDULED',
      journeyStatusUpdatedAt: new Date(),
      domainId,
    });
  },

  async listDispatches(domainId: string, query: PaginationQuery) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, dispatches] = await DispatchRepository.listByDomain(
      domainId,
      limit,
      offset,
    );

    return {
      dispatches,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },
};
