import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { StatusEnum } from '@constants/index';
import { resolveHttpStatus } from '@/utils/httpError';
import { maintenanceScheduleService } from './maintenanceSchedule.service';
import type {
  MaintenanceAssetType,
  MaintenanceScheduleStatus,
} from '@repositories/index';

export const maintenanceScheduleController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const {
        code,
        title,
        assetType,
        vehicleId,
        machineryId,
        nextDueDate,
        scheduleStatus,
        status,
      } = req.body as {
        code?: string;
        title?: Record<string, unknown>;
        assetType?: MaintenanceAssetType;
        vehicleId?: string | null;
        machineryId?: string | null;
        nextDueDate?: string;
        scheduleStatus?: MaintenanceScheduleStatus;
        status?: StatusEnum;
      };

      const schedule = await maintenanceScheduleService.create(
        {
          code: code ?? '',
          title: title ?? {},
          assetType: assetType ?? 'VEHICLE',
          ...(vehicleId !== undefined && { vehicleId }),
          ...(machineryId !== undefined && { machineryId }),
          nextDueDate: nextDueDate ?? '',
          scheduleStatus: scheduleStatus ?? 'SCHEDULED',
          domainId: req.user!.domainId,
          adminId: req.user!.adminId,
          status: status ?? StatusEnum.ACTIVE,
        },
        language,
      );

      return res.status(HttpStatus.CREATED).json({
        message: 'Maintenance schedule created successfully',
        data: schedule,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create maintenance schedule';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        null;

      const { maintenanceSchedules, pagination } =
        await maintenanceScheduleService.getAll(
          (req.query.domainId as string) ?? '',
          req.user!.adminId,
          req.query,
          language,
        );

      return res.status(HttpStatus.OK).json({
        message: 'Maintenance schedules fetched successfully',
        pagination: {
          currentCount: maintenanceSchedules.length,
          ...pagination,
        },
        data: maintenanceSchedules,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch maintenance schedules';
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

      const schedule = await maintenanceScheduleService.getById(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
        language,
      );

      if (!schedule) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Maintenance schedule fetched successfully',
        data: schedule,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch maintenance schedule';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const {
        code,
        title,
        assetType,
        vehicleId,
        machineryId,
        nextDueDate,
        scheduleStatus,
        status,
      } = req.body as {
        code?: string;
        title?: Record<string, unknown>;
        assetType?: MaintenanceAssetType;
        vehicleId?: string | null;
        machineryId?: string | null;
        nextDueDate?: string;
        scheduleStatus?: MaintenanceScheduleStatus;
        status?: StatusEnum;
      };

      const schedule = await maintenanceScheduleService.update(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
        {
          ...(code !== undefined && { code }),
          ...(title !== undefined && { title }),
          ...(assetType !== undefined && { assetType }),
          ...(vehicleId !== undefined && { vehicleId }),
          ...(machineryId !== undefined && { machineryId }),
          ...(nextDueDate !== undefined && { nextDueDate }),
          ...(scheduleStatus !== undefined && { scheduleStatus }),
          ...(status !== undefined && { status }),
        },
        language,
      );

      if (!schedule) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Maintenance schedule updated successfully',
        data: schedule,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update maintenance schedule';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  advance: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const { nextDueDate, scheduleStatus } = req.body as {
        nextDueDate?: string;
        scheduleStatus?: MaintenanceScheduleStatus;
      };

      const schedule = await maintenanceScheduleService.advance(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
        {
          nextDueDate,
          scheduleStatus,
        },
        language,
      );

      if (!schedule) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Maintenance schedule advanced successfully',
        data: schedule,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to advance maintenance schedule';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };

      const schedule = await maintenanceScheduleService.softDelete(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
      );

      if (!schedule) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Maintenance schedule deleted successfully',
        data: schedule,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete maintenance schedule';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
