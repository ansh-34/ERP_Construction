import { Messages } from '../../../constants/index.js';
import { VehicleRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { translateResponse } from '../../../utils/translation.js';

export const VehicleService = {
  async getStats(domainId: string) {
    return VehicleRepository.getStats(domainId);
  },

  async getVehicleById(domainId: string, id: string) {
    const vehicle = await VehicleRepository.findByIdWithDetails(id, domainId);
    if (!vehicle) {
      throw new Error(Messages.VEHICLE.NOT_FOUND);
    }
    return vehicle;
  },

  async createVehicle(
    domainId: string,
    data: {
      numberPlate: string;
      vehicleType: string;
      loadCapacity: number;
      loadCapacityUomId: string;
      alertLoadThreshold: number;
    },
  ) {
    const {
      numberPlate,
      vehicleType,
      loadCapacity,
      loadCapacityUomId,
      alertLoadThreshold,
    } = data;

    if (!numberPlate) {
      throw new Error(Messages.VEHICLE.NUMBER_PLATE_REQUIRED);
    }

    const existing =
      await VehicleRepository.findActiveByNumberPlate(numberPlate);

    if (existing) {
      throw new Error(Messages.VEHICLE.NUMBER_PLATE_ALREADY_EXISTS);
    }

    return VehicleRepository.create({
      numberPlate,
      vehicleType,
      loadCapacity,
      loadCapacityUomId,
      alertLoadThreshold,
      domainId,
    });
  },

  async updateVehicle(
    domainId: string,
    data: {
      id: string;
      numberPlate?: string;
      vehicleType?: string;
      loadCapacity?: number;
      loadCapacityUomId?: string;
      alertLoadThreshold?: number;
      status?: 'ACTIVE' | 'INACTIVE';
    },
  ) {
    const { id, ...updates } = data;

    const existing = await VehicleRepository.findActiveByIdAndDomain(
      id,
      domainId,
    );
    if (!existing) {
      throw new Error(Messages.VEHICLE.NOT_FOUND);
    }

    if (updates.numberPlate) {
      const duplicate =
        await VehicleRepository.findActiveByNumberPlateExcludingId(
          updates.numberPlate,
          id,
        );
      if (duplicate) {
        throw new Error(Messages.VEHICLE.NUMBER_PLATE_ALREADY_EXISTS);
      }
    }

    return VehicleRepository.update(id, updates);
  },

  async listVehicles(
    domainId: string,
    query: PaginationQuery & {
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
    },
    langCode?: string,
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, rawVehicles] = await VehicleRepository.listByDomain(
      domainId,
      limit,
      offset,
      {
        status: query.status,
        searchKey: query.searchKey,
      },
    );

    // Flatten arrays into single objects for frontend convenience
    const vehicles = rawVehicles.map(
      ({ journeySchedules, dispatches, ...vehicle }) => ({
        ...vehicle,
        latestSchedule: journeySchedules[0] ?? null,
        latestDispatch: dispatches[0] ?? null,
      }),
    );

    return {
      vehicles: translateResponse(vehicles, langCode),
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getAnalytics(domainId: string) {
    return VehicleRepository.getAnalytics(domainId);
  },

  async deleteVehicle(domainId: string, id: string) {
    const vehicle = await VehicleRepository.findActiveByIdAndDomain(
      id,
      domainId,
    );
    if (!vehicle) {
      throw new Error(Messages.VEHICLE.NOT_FOUND);
    }
    return VehicleRepository.softDelete(id);
  },
};
