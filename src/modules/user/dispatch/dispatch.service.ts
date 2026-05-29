import { Messages } from '../../../constants/index.js';
import {
  DispatchRepository,
  JourneyScheduleRepository,
  VehicleRepository,
} from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { translateResponse } from '../../../utils/translation.js';

export const DispatchService = {
  async getStats(domainId: string) {
    return DispatchRepository.getStats(domainId);
  },

  async generateCode(domainId: string, vehicleId: string): Promise<string> {
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

      const code = `DV-${day}${month}${year}${hours}${minutes}${seconds}`;

      const existing = await DispatchRepository.findDuplicateForVehicle(
        code,
        domainId,
        vehicleId,
      );
      if (!existing) {
        return code;
      }
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error('Failed to generate unique dispatch code');
  },

  async createDispatch(
    domainId: string,
    data: {
      vehicleId: string;
      journeyScheduleId: string;
      description?: string;
      actualFuelValue: number;
      journeyStatus: string;
    },
  ) {
    const {
      vehicleId,
      journeyScheduleId,
      description,
      actualFuelValue,
      journeyStatus,
    } = data;

    if (!vehicleId) {
      throw new Error(Messages.DISPATCH.VEHICLE_CODE_REQUIRED);
    }

    // Validate parent Vehicle exists
    const vehicle = await VehicleRepository.findActiveByIdAndDomain(
      vehicleId,
      domainId,
    );

    if (!vehicle) {
      throw new Error(Messages.VEHICLE.NOT_FOUND_IN_DOMAIN);
    }

    // Validate parent Journey Schedule exists and inherit fields
    const schedule = await JourneyScheduleRepository.findActiveByIdAndDomain(
      journeyScheduleId,
      domainId,
    );

    if (!schedule) {
      throw new Error(Messages.JOURNEY_SCHEDULE.NOT_FOUND);
    }

    // Generate code automatically
    const code = await DispatchService.generateCode(domainId, vehicleId);

    // Check duplicate
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
      journeyScheduleId,
      description: description || null,
      date: new Date(),
      driverName: schedule.driverName,
      startLocation: schedule.startLocation,
      endLocation: schedule.endLocation,
      distance: schedule.distance,
      average: schedule.average,
      expectedFuelValue: schedule.expectedFuelValue,
      actualFuelValue,
      fuelAlertThreshold: schedule.fuelAlertThreshold,
      loadedQuantity: schedule.loadedQuantity,
      loadedQuantityUomId: schedule.loadedQuantityUomId,
      loadedAt: schedule.loadedAt,
      loadingStatus: schedule.loadingStatus,
      journeyStatus,
      journeyStatusUpdatedAt: new Date(),
      domainId,
    });
  },

  async listDispatches(
    domainId: string,
    query: PaginationQuery,
    langCode?: string,
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, dispatches] = await DispatchRepository.listByDomain(
      domainId,
      limit,
      offset,
    );

    return {
      dispatches: translateResponse(dispatches, langCode),
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },
};
