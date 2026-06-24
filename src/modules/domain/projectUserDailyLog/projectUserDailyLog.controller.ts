import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { AttendanceStatusEnum, StatusEnum } from '@constants/index';
import { resolveHttpStatus } from '@/utils/httpError';
import { projectUserDailyLogService } from './projectUserDailyLog.service';

export const projectUserDailyLogController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const logs = req.body as {
        date: string;
        projectId: string;
        userId: string;
        startTime?: string | null;
        endTime?: string | null;
        totalWorkingHours?: number;
        dayCharge: number;
        attendanceStatus?: AttendanceStatusEnum;
        notes?: string | null;
        status?: StatusEnum;
      }[];

      const dailyLogs = await projectUserDailyLogService.create(
        {
          logs,
          domainId: req.user!.domainId,
          adminId: req.user!.adminId,
        },
        language,
      );

      return res.status(HttpStatus.CREATED).json({
        message: 'Project user daily logs created successfully',
        data: dailyLogs,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create project user daily logs';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        null;
      const {
        projectId,
        userId,
        date,
        startDate,
        endDate,
        searchKey,
        offset,
        limit,
      } = req.query as {
        projectId?: string;
        userId?: string;
        date?: string;
        startDate?: string;
        endDate?: string;
        searchKey?: string;
        offset?: string;
        limit?: string;
      };

      const { projectUserDailyLogs, pagination } =
        await projectUserDailyLogService.getAll(
          req.user!.domainId,
          req.user!.adminId,
          { projectId, userId, date, startDate, endDate, searchKey },
          { offset, limit },
          language,
        );

      return res.status(HttpStatus.OK).json({
        message: 'Project user daily logs fetched successfully',
        pagination: {
          currentCount: projectUserDailyLogs.length,
          ...pagination,
        },
        data: projectUserDailyLogs,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch project user daily logs';
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
      const dailyLog = await projectUserDailyLogService.getById(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
        language,
      );

      if (!dailyLog) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project user daily log fetched successfully',
        data: dailyLog,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch project user daily log';
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
      const {
        date,
        startTime,
        endTime,
        totalWorkingHours,
        dayCharge,
        attendanceStatus,
        notes,
        status,
      } = req.body as {
        date?: string;
        startTime?: string | null;
        endTime?: string | null;
        totalWorkingHours?: number;
        dayCharge?: number;
        attendanceStatus?: AttendanceStatusEnum;
        notes?: string | null;
        status?: StatusEnum;
      };

      const dailyLog = await projectUserDailyLogService.update(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
        {
          ...(date !== undefined && { date }),
          ...(startTime !== undefined && { startTime }),
          ...(endTime !== undefined && { endTime }),
          ...(totalWorkingHours !== undefined && { totalWorkingHours }),
          ...(dayCharge !== undefined && { dayCharge }),
          ...(attendanceStatus !== undefined && { attendanceStatus }),
          ...(notes !== undefined && { notes }),
          ...(status !== undefined && { status }),
        },
        language,
      );

      if (!dailyLog) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project user daily log updated successfully',
        data: dailyLog,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update project user daily log';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const dailyLog = await projectUserDailyLogService.softDelete(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
      );

      if (!dailyLog) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project user daily log deleted successfully',
        data: dailyLog,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete project user daily log';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
