import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { StatusEnum } from '@constants/index';
import { resolveHttpStatus } from '@/utils/httpError';
import { projectTaskService } from './projectTask.service';

export const projectTaskController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const {
        name,
        assignee,
        plannedStartDate,
        plannedEndDate,
        actualStartDate,
        actualEndDate,
        taskStatus,
        taskProgress,
        totalDelayInDays,
        requiredApproval,
        lastApprovedDeadline,
        projectBatchCode,
        stageId,
        projectId,
        status,
      } = req.body as {
        name?: Record<string, unknown>;
        assignee?: Record<string, unknown> | null;
        plannedStartDate?: string | null;
        plannedEndDate?: string | null;
        actualStartDate?: string | null;
        actualEndDate?: string | null;
        taskStatus?: string;
        taskProgress?: number;
        totalDelayInDays?: number;
        requiredApproval?: boolean;
        lastApprovedDeadline?: string | null;
        projectBatchCode?: string | null;
        stageId?: string;
        projectId?: string;
        status?: StatusEnum;
      };

      const domainId = req.user!.domainId;
      const adminId = req.user!.adminId;

      const projectTask = await projectTaskService.create(
        {
          name: name ?? {},
          ...(assignee !== undefined && { assignee }),
          ...(plannedStartDate !== undefined && { plannedStartDate }),
          ...(plannedEndDate !== undefined && { plannedEndDate }),
          ...(actualStartDate !== undefined && { actualStartDate }),
          ...(actualEndDate !== undefined && { actualEndDate }),
          ...(taskStatus !== undefined && { taskStatus }),
          ...(taskProgress !== undefined && { taskProgress }),
          ...(totalDelayInDays !== undefined && { totalDelayInDays }),
          ...(requiredApproval !== undefined && { requiredApproval }),
          ...(lastApprovedDeadline !== undefined && { lastApprovedDeadline }),
          ...(projectBatchCode !== undefined && { projectBatchCode }),
          stageId: stageId ?? '',
          projectId: projectId ?? '',
          domainId,
          adminId,
          status: status ?? StatusEnum.ACTIVE,
        },
        language,
      );

      return res.status(HttpStatus.CREATED).json({
        message: 'Project task created successfully',
        data: projectTask,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create project task';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { projectId, stageId, searchKey } = req.query as {
        projectId?: string;
        stageId?: string;
        searchKey?: string;
      };

      const projectTasks = await projectTaskService.getAll(
        req.user!.domainId,
        req.user!.adminId,
        projectId,
        stageId,
        searchKey,
        language,
      );

      return res.status(HttpStatus.OK).json({
        message: 'Project tasks fetched successfully',
        data: projectTasks,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch project tasks';
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
      const projectTask = await projectTaskService.getById(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
        language,
      );

      if (!projectTask) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project task fetched successfully',
        data: projectTask,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch project task';
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
        name,
        assignee,
        plannedStartDate,
        plannedEndDate,
        actualStartDate,
        actualEndDate,
        taskStatus,
        taskProgress,
        totalDelayInDays,
        requiredApproval,
        lastApprovedDeadline,
        projectBatchCode,
        status,
      } = req.body as {
        name?: Record<string, unknown>;
        assignee?: Record<string, unknown> | null;
        plannedStartDate?: string | null;
        plannedEndDate?: string | null;
        actualStartDate?: string | null;
        actualEndDate?: string | null;
        taskStatus?: string;
        taskProgress?: number;
        totalDelayInDays?: number;
        requiredApproval?: boolean;
        lastApprovedDeadline?: string | null;
        projectBatchCode?: string | null;
        status?: StatusEnum;
      };

      const updatedProjectTask = await projectTaskService.update(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
        {
          ...(name !== undefined && { name }),
          ...(assignee !== undefined && { assignee }),
          ...(plannedStartDate !== undefined && { plannedStartDate }),
          ...(plannedEndDate !== undefined && { plannedEndDate }),
          ...(actualStartDate !== undefined && { actualStartDate }),
          ...(actualEndDate !== undefined && { actualEndDate }),
          ...(taskStatus !== undefined && { taskStatus }),
          ...(taskProgress !== undefined && { taskProgress }),
          ...(totalDelayInDays !== undefined && { totalDelayInDays }),
          ...(requiredApproval !== undefined && { requiredApproval }),
          ...(lastApprovedDeadline !== undefined && { lastApprovedDeadline }),
          ...(projectBatchCode !== undefined && { projectBatchCode }),
          ...(status !== undefined && { status }),
        },
        language,
      );

      if (!updatedProjectTask) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project task updated successfully',
        data: updatedProjectTask,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update project task';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const deletedProjectTask = await projectTaskService.softDelete(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
      );

      if (!deletedProjectTask) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project task deleted successfully',
        data: deletedProjectTask,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete project task';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
