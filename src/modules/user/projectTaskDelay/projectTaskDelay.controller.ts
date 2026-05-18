import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { StatusEnum } from '@constants/index';
import { resolveHttpStatus } from '@/utils/httpError';
import { projectTaskDelayService } from './projectTaskDelay.service';

export const projectTaskDelayController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const {
        taskId,
        requestedDelayInDays,
        delayReason,
        requestApproved,
        requestApprovalTime,
        stageId,
        projectId,
        status,
      } = req.body as {
        taskId?: string;
        requestedDelayInDays?: number;
        delayReason?: string;
        requestApproved?: boolean;
        requestApprovalTime?: string | null;
        stageId?: string;
        projectId?: string;
        status?: StatusEnum;
      };

      const domainId = req.user!.domainId;
      const adminId = req.user!.adminId;

      const projectTaskDelay = await projectTaskDelayService.create(
        {
          taskId: taskId ?? '',
          requestedDelayInDays: requestedDelayInDays ?? 0,
          delayReason: delayReason ?? '',
          ...(requestApproved !== undefined && { requestApproved }),
          ...(requestApprovalTime !== undefined && { requestApprovalTime }),
          stageId: stageId ?? '',
          projectId: projectId ?? '',
          domainId,
          adminId,
          status: status ?? StatusEnum.ACTIVE,
        },
        language,
      );

      return res.status(HttpStatus.CREATED).json({
        message: 'Project task delay created successfully',
        data: projectTaskDelay,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create project task delay';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { projectId, stageId, taskId, searchKey } = req.query as {
        projectId?: string;
        stageId?: string;
        taskId?: string;
        searchKey?: string;
      };
      const projectTaskDelays = await projectTaskDelayService.getAll(
        req.user!.domainId,
        req.user!.adminId,
        projectId,
        stageId,
        taskId,
        searchKey,
        language,
      );

      return res.status(HttpStatus.OK).json({
        message: 'Project task delays fetched successfully',
        data: projectTaskDelays,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch project task delays';
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
      const projectTaskDelay = await projectTaskDelayService.getById(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
        language,
      );

      if (!projectTaskDelay) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project task delay fetched successfully',
        data: projectTaskDelay,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch project task delay';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const {
        requestedDelayInDays,
        delayReason,
        requestApproved,
        requestApprovalTime,
        status,
      } = req.body as {
        requestedDelayInDays?: number;
        delayReason?: string;
        requestApproved?: boolean;
        requestApprovalTime?: string | null;
        status?: StatusEnum;
      };

      const updatedProjectTaskDelay = await projectTaskDelayService.update(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
        {
          ...(requestedDelayInDays !== undefined && { requestedDelayInDays }),
          ...(delayReason !== undefined && { delayReason }),
          ...(requestApproved !== undefined && { requestApproved }),
          ...(requestApprovalTime !== undefined && { requestApprovalTime }),
          ...(status !== undefined && { status }),
        },
        language,
      );

      if (!updatedProjectTaskDelay) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project task delay updated successfully',
        data: updatedProjectTaskDelay,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update project task delay';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const deletedProjectTaskDelay = await projectTaskDelayService.softDelete(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
      );

      if (!deletedProjectTaskDelay) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project task delay deleted successfully',
        data: deletedProjectTaskDelay,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete project task delay';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
