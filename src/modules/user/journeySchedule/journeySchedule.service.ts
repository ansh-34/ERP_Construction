import { Messages } from '../../../constants/index.js';
import {
  JourneyScheduleRepository,
  VehicleRepository,
} from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { translateResponse } from '../../../utils/translation.js';

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

  async getJourneyScheduleById(domainId: string, id: string) {
    const schedule = await JourneyScheduleRepository.findByIdWithIncludes(
      id,
      domainId,
    );
    if (!schedule) {
      throw new Error(Messages.JOURNEY_SCHEDULE.NOT_FOUND);
    }
    return schedule;
  },

  async updateJourneySchedule(
    domainId: string,
    id: string,
    data: {
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
    const schedule = await JourneyScheduleRepository.findActiveByIdAndDomain(
      id,
      domainId,
    );
    if (!schedule) {
      throw new Error(Messages.JOURNEY_SCHEDULE.NOT_FOUND);
    }

    const updateData: Record<string, unknown> = {};
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.driverName !== undefined) updateData.driverName = data.driverName;
    if (data.startLocation !== undefined)
      updateData.startLocation = data.startLocation;
    if (data.endLocation !== undefined)
      updateData.endLocation = data.endLocation;
    if (data.distance !== undefined) updateData.distance = data.distance;
    if (data.average !== undefined) updateData.average = data.average;
    if (data.expectedFuelValue !== undefined)
      updateData.expectedFuelValue = data.expectedFuelValue;
    if (data.fuelAlertThreshold !== undefined)
      updateData.fuelAlertThreshold = data.fuelAlertThreshold;
    if (data.loadedQuantity !== undefined)
      updateData.loadedQuantity = data.loadedQuantity;
    if (data.loadedQuantityUomId !== undefined)
      updateData.loadedQuantityUomId = data.loadedQuantityUomId;
    if (data.loadedAt !== undefined)
      updateData.loadedAt = new Date(data.loadedAt);
    if (data.loadingStatus !== undefined)
      updateData.loadingStatus = data.loadingStatus;

    return JourneyScheduleRepository.update(id, updateData);
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
      average?: number;
      expectedFuelValue?: number;
      fuelAlertThreshold?: number;
      loadedQuantity?: number;
      loadedQuantityUomId?: string;
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

  async listJourneySchedules(
    domainId: string,
    query: PaginationQuery,
    langCode?: string,
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, schedules] =
      await JourneyScheduleRepository.listByDomain(domainId, limit, offset);

    return {
      schedules: translateResponse(schedules, langCode),
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
