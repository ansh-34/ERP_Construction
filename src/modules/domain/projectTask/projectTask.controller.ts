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
        images,
        status,
      } = req.body as {
        name?: Record<string, unknown>;
        assignee?: string | null;
        plannedStartDate?: string | null;
        plannedEndDate?: string | null;
        actualStartDate?: string | null;
        actualEndDate?: string | null;
        taskStatus?: string;
        taskProgress?: number;
        totalDelayInDays?: number;
        requiredApproval?: boolean | null;
        lastApprovedDeadline?: string | null;
        projectBatchCode?: string | null;
        stageId?: string;
        projectId?: string;
        images?: {
          imageId: string;
          description?: string | null;
        }[];
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
          ...(images !== undefined && {
            images: images.map((img) => ({
              ...img,
              description: img.description === '' ? null : img.description,
            })),
          }),
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
        null;
      const { domainId, projectId, stageId, searchKey, offset, limit } =
        req.query as {
          domainId?: string;
          projectId?: string;
          stageId?: string;
          searchKey?: string;
          offset?: string;
          limit?: string;
        };

      const { projectTasks, pagination } = await projectTaskService.getAll(
        domainId ?? '',
        req.user!.adminId,
        projectId,
        stageId,
        searchKey,
        { offset, limit },
        language,
      );

      return res.status(HttpStatus.OK).json({
        message: 'Project tasks fetched successfully',
        pagination: {
          currentCount: projectTasks.length,
          ...pagination,
        },
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
      const { domainId } = req.query as { domainId?: string };
      const projectTask = await projectTaskService.getById(
        id ?? '',
        domainId ?? '',
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
      const { domainId } = req.query as { domainId?: string };
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
        images,
        status,
      } = req.body as {
        name?: Record<string, unknown>;
        assignee?: string | null;
        plannedStartDate?: string | null;
        plannedEndDate?: string | null;
        actualStartDate?: string | null;
        actualEndDate?: string | null;
        taskStatus?: string;
        taskProgress?: number;
        totalDelayInDays?: number;
        requiredApproval?: boolean | null;
        lastApprovedDeadline?: string | null;
        projectBatchCode?: string | null;
        images?: {
          imageId: string;
          description?: string | null;
        }[];
        status?: StatusEnum;
      };

      const updatedProjectTask = await projectTaskService.update(
        id ?? '',
        domainId ?? '',
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
          ...(images !== undefined && {
            images: images.map((img) => ({
              ...img,
              description: img.description === '' ? null : img.description,
            })),
          }),
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

  approveOrReject: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { ids, approvalState } = req.body as {
        ids?: string | string[];
        approvalState?: 'APPROVED' | 'REJECTED';
      };

      const updatedProjectTasks = await projectTaskService.approveOrReject(
        ids ?? [],
        req.user!.domainId,
        req.user!.adminId,
        approvalState ?? 'APPROVED',
        language,
      );

      return res.status(HttpStatus.OK).json({
        message: 'Project task approval updated successfully',
        data: updatedProjectTasks,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to approve or reject project task';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const deletedProjectTask = await projectTaskService.softDelete(
        id ?? '',
        domainId ?? '',
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
