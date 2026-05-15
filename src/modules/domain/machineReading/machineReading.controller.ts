import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { StatusEnum } from '@constants/index';
import { resolveHttpStatus } from '@/utils/httpError';
import { machineReadingService } from './machineReading.service';

export const machineReadingController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const {
        date,
        openingFuelStock,
        fuelRefillQuantity,
        machineStartTime,
        projectId,
        status,
      } = req.body as {
        date?: string;
        openingFuelStock?: number;
        fuelRefillQuantity?: number;
        machineStartTime?: string;
        projectId?: string;
        status?: StatusEnum;
      };

      const domainId = req.user!.domainId;
      const adminId = req.user!.adminId;

      const machineReading = await machineReadingService.create({
        date: date ?? '',
        openingFuelStock: openingFuelStock ?? 0,
        ...(fuelRefillQuantity !== undefined && { fuelRefillQuantity }),
        machineStartTime: machineStartTime ?? '',
        projectId: projectId ?? '',
        domainId,
        adminId,
        status: status ?? StatusEnum.ACTIVE,
      });

      return res.status(HttpStatus.CREATED).json({
        message: 'Machine reading created successfully',
        data: machineReading,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create machine reading';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { domainId, projectId, searchKey } = req.query as {
        domainId?: string;
        projectId?: string;
        searchKey?: string;
      };

      const machineReadings = await machineReadingService.getAll(
        domainId ?? '',
        req.user!.adminId,
        projectId,
        searchKey,
      );

      return res.status(HttpStatus.OK).json({
        message: 'Machine readings fetched successfully',
        data: machineReadings,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch machine readings';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getById: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const machineReading = await machineReadingService.getById(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
      );

      if (!machineReading) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Machine reading fetched successfully',
        data: machineReading,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch machine reading';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const { closingFuelStock, fuelRefillQuantity, machineEndTime, status } =
        req.body as {
          closingFuelStock?: number;
          fuelRefillQuantity?: number;
          machineEndTime?: string;
          status?: StatusEnum;
        };

      const updatedMachineReading = await machineReadingService.update(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
        {
          closingFuelStock: closingFuelStock ?? 0,
          ...(fuelRefillQuantity !== undefined && { fuelRefillQuantity }),
          machineEndTime: machineEndTime ?? '',
          ...(status !== undefined && { status }),
        },
      );

      if (!updatedMachineReading) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Machine reading updated successfully',
        data: updatedMachineReading,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update machine reading';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
