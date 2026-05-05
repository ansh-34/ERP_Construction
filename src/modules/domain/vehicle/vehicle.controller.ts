import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { VehicleService } from './vehicle.service.js';

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
    const { vehicles, pagination } = await VehicleService.listVehicles(
      req.user!.domainId,
      req.query as PaginationQuery,
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
