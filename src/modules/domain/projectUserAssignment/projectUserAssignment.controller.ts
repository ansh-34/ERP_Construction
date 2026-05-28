import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { StatusEnum } from '@constants/index';
import { resolveHttpStatus } from '@/utils/httpError';
import { projectUserAssignmentService } from './projectUserAssignment.service';

export const projectUserAssignmentController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const assignments = req.body as {
        projectId: string;
        userId: string;
        startDate: string;
        endDate: string;
        dailyWorkingHours: number;
        dayCharge: number;
        notes?: string | null;
        status?: StatusEnum;
      }[];

      const assignmentsResult = await projectUserAssignmentService.create(
        {
          assignments,
          domainId: req.user!.domainId,
          adminId: req.user!.adminId,
        },
        language,
      );

      return res.status(HttpStatus.CREATED).json({
        message: 'Project user assignments created successfully',
        data: assignmentsResult,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create project user assignments';
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
        startDate,
        endDate,
        currentDate,
        searchKey,
        offset,
        limit,
      } = req.query as {
        projectId?: string;
        userId?: string;
        startDate?: string;
        endDate?: string;
        currentDate?: string;
        searchKey?: string;
        offset?: string;
        limit?: string;
      };

      const { projectUserAssignments, pagination } =
        await projectUserAssignmentService.getAll(
          req.user!.domainId,
          req.user!.adminId,
          { projectId, userId, startDate, endDate, currentDate, searchKey },
          { offset, limit },
          language,
        );

      return res.status(HttpStatus.OK).json({
        message: 'Project user assignments fetched successfully',
        pagination: {
          currentCount: projectUserAssignments.length,
          ...pagination,
        },
        data: projectUserAssignments,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch project user assignments';
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
      const assignment = await projectUserAssignmentService.getById(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
        language,
      );

      if (!assignment) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project user assignment fetched successfully',
        data: assignment,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch project user assignment';
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
        startDate,
        endDate,
        dailyWorkingHours,
        dayCharge,
        notes,
        status,
      } = req.body as {
        startDate?: string;
        endDate?: string;
        dailyWorkingHours?: number;
        dayCharge?: number;
        notes?: string | null;
        status?: StatusEnum;
      };

      const assignment = await projectUserAssignmentService.update(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
        {
          ...(startDate !== undefined && { startDate }),
          ...(endDate !== undefined && { endDate }),
          ...(dailyWorkingHours !== undefined && { dailyWorkingHours }),
          ...(dayCharge !== undefined && { dayCharge }),
          ...(notes !== undefined && { notes }),
          ...(status !== undefined && { status }),
        },
        language,
      );

      if (!assignment) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project user assignment updated successfully',
        data: assignment,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update project user assignment';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const assignment = await projectUserAssignmentService.softDelete(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
      );

      if (!assignment) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project user assignment deleted successfully',
        data: assignment,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete project user assignment';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
