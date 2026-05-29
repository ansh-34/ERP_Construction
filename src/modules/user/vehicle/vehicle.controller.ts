import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { VehicleService } from './vehicle.service.js';
import prisma from '../../../infra/database/prisma/prisma.client.js';

export const getVehicleStats = async (req: Request, res: Response) => {
  try {
    const stats = await VehicleService.getStats(req.user!.domainId);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.VEHICLE.STATS_RETRIEVED,
      data: stats,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.VEHICLE.STATS_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const vehicle = await VehicleService.getVehicleById(
      req.user!.domainId,
      req.params.id,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.VEHICLE.RETRIEVED,
      data: vehicle,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.VEHICLE.DETAIL_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const vehicle = await VehicleService.createVehicle(
      req.user!.domainId,
      req.body,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.VEHICLE.CREATED,
      data: vehicle,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.VEHICLE.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listVehicles = async (req: Request, res: Response) => {
  try {
    const language = req.headers.language as string | undefined;
    const { vehicles, pagination } = await VehicleService.listVehicles(
      req.user!.domainId,
      req.query as any,
      language,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.VEHICLE.RETRIEVED,
      pagination: {
        currentCount: vehicles.length,
        ...pagination,
      },
      data: vehicles,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.VEHICLE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    await VehicleService.deleteVehicle(req.user!.domainId, req.params.id);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.VEHICLE.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.VEHICLE.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

// GET /vehicles/analytics
export const getVehicleAnalytics = async (req: Request, res: Response) => {
  try {
    const domainId = req.user!.domainId;

    const [
      vehiclesTotal,
      vehiclesActive,
      vehiclesInactive,
      vehicleCapacitySum,
    ] = await Promise.all([
      prisma.vehicle.count({
        where: { domainId, isDeleted: false },
      }),
      prisma.vehicle.count({
        where: { domainId, isDeleted: false, status: 'ACTIVE' },
      }),
      prisma.vehicle.count({
        where: { domainId, isDeleted: false, status: 'INACTIVE' },
      }),
      prisma.vehicle.aggregate({
        where: { domainId, isDeleted: false },
        _sum: { loadCapacity: true },
      }),
    ]);

    const totalCapacity = vehicleCapacitySum._sum.loadCapacity ?? 0;

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Vehicle analytics retrieved successfully',
      data: {
        vehicles: {
          total: vehiclesTotal,
          active: vehiclesActive,
          inactive: vehiclesInactive,
          totalCapacity,
        },
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to retrieve vehicle analytics';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
