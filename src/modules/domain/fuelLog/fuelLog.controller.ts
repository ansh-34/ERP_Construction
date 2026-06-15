import type { Request, Response } from 'express';
import { HttpStatus, Messages, StatusEnum } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { FuelLogService } from './fuelLog.service.js';
import type {
  FuelType,
  FuelDirectionType,
  MaintenanceAssetType,
} from '../../../repositories/index.js';

export const createFuelLog = async (req: Request, res: Response) => {
  try {
    const {
      fuelType,
      equipmentUniqueId,
      equipmentCategory,
      equipmentType,
      date,
      fuelDirectionType,
      fuelValue,
      fuelQuantity,
      fuelUomId,
      projectId,
    } = req.body as {
      fuelType: FuelType;
      equipmentUniqueId: string;
      equipmentCategory: MaintenanceAssetType;
      equipmentType: string;
      date: string;
      fuelDirectionType: FuelDirectionType;
      fuelValue: number;
      fuelQuantity: number;
      fuelUomId: string;
      projectId: string;
    };

    const log = await FuelLogService.create({
      fuelType,
      equipmentUniqueId,
      equipmentCategory,
      equipmentType,
      date,
      fuelDirectionType,
      fuelValue,
      fuelQuantity,
      fuelUomId,
      projectId,
      domainId: req.user!.domainId,
      adminId: req.user!.adminId,
      status: StatusEnum.ACTIVE,
    });

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.FUEL_LOG.CREATED,
      data: log,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.FUEL_LOG.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listFuelLogs = async (req: Request, res: Response) => {
  try {
    const { fuelLogs, pagination } = await FuelLogService.getAll(
      req.user!.domainId,
      req.user!.adminId,
      req.query,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.FUEL_LOG.LIST_RETRIEVED,
      pagination,
      data: fuelLogs,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.FUEL_LOG.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getFuelLogById = async (req: Request, res: Response) => {
  try {
    const log = await FuelLogService.getById(
      req.params.id,
      req.user!.domainId,
      req.user!.adminId,
    );

    if (!log) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: Messages.FUEL_LOG.NOT_FOUND });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.FUEL_LOG.RETRIEVED,
      data: log,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.FUEL_LOG.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const updateFuelLog = async (req: Request, res: Response) => {
  try {
    const log = await FuelLogService.update(
      req.params.id,
      req.user!.domainId,
      req.user!.adminId,
      req.body,
    );

    if (!log) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: Messages.FUEL_LOG.NOT_FOUND });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.FUEL_LOG.UPDATED,
      data: log,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.FUEL_LOG.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteFuelLog = async (req: Request, res: Response) => {
  try {
    const log = await FuelLogService.softDelete(
      req.params.id,
      req.user!.domainId,
      req.user!.adminId,
    );

    if (!log) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: Messages.FUEL_LOG.NOT_FOUND });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.FUEL_LOG.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.FUEL_LOG.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
