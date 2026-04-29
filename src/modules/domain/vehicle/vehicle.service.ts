import { Messages } from '../../../constants/index.js';
import { VehicleRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const VehicleService = {
  async createVehicle(
    domainId: string,
    data: {
      numberPlate: string;
      vehicleType?: string;
      loadCapacity?: number;
      loadCapacityUomId?: string;
      alertLoadThreshold?: number;
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
      vehicleType: vehicleType ?? 'TRUCK',
      loadCapacity: loadCapacity ?? 0,
      loadCapacityUomId: loadCapacityUomId || null,
      alertLoadThreshold: alertLoadThreshold ?? 0,
      domainId,
    });
  },

  async listVehicles(domainId: string, query: PaginationQuery) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, vehicles] = await VehicleRepository.listByDomain(
      domainId,
      limit,
      offset,
    );

    return {
      vehicles,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },
};
