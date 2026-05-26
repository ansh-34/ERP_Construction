import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { StatusEnum } from '@constants/index';
import { projectService } from './project.service';
import { resolveHttpStatus } from '@/utils/httpError';

export const projectController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const {
        name,
        description,
        budget,
        spent,
        expectedStartDate,
        expectedEndDate,
        locationId,
        status,
        projectStages,
      } = req.body as {
        name?: Record<string, unknown>;
        description?: string | null;
        budget?: number;
        spent?: number;
        expectedStartDate?: string;
        expectedEndDate?: string;
        locationId?: string;
        status?: StatusEnum;
        projectStages?: {
          name: Record<string, unknown>;
          description?: string | null;
          progress?: number | null;
          expectedStartDate?: string;
          expectedEndDate?: string;
          status?: StatusEnum;
        }[];
      };

      const domainId = req.user!.domainId;
      const adminId = req.user!.adminId;

      const project = await projectService.create(
        {
          name: name ?? {},
          ...(description !== undefined && { description }),
          budget: budget ?? 0,
          ...(spent !== undefined && { spent }),
          ...(expectedStartDate !== undefined && { expectedStartDate }),
          ...(expectedEndDate !== undefined && { expectedEndDate }),
          locationId: locationId ?? '',
          ...(projectStages !== undefined && { projectStages }),
          domainId,
          adminId,
          status: status ?? StatusEnum.ACTIVE,
        },
        language,
      );

      return res.status(HttpStatus.CREATED).json({
        message: 'Project created successfully',
        data: project,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to create project';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { domainId, searchKey, offset, limit } = req.query as {
        domainId?: string;
        searchKey?: string;
        offset?: string;
        limit?: string;
      };
      const { projects, pagination } = await projectService.getAll(
        domainId ?? '',
        req.user!.adminId,
        searchKey,
        { offset, limit },
        language,
      );

      return res.status(HttpStatus.OK).json({
        message: 'Projects fetched successfully',
        pagination: {
          currentCount: projects.length,
          ...pagination,
        },
        data: projects,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch projects';
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
      const project = await projectService.getById(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
        language,
      );

      if (!project) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project fetched successfully',
        data: project,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch project';
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
        description,
        budget,
        spent,
        actualStartDate,
        actualEndDate,
        locationId,
        status,
      } = req.body as {
        name?: Record<string, unknown>;
        description?: string | null;
        budget?: number;
        spent?: number;
        actualStartDate?: string | null;
        actualEndDate?: string | null;
        locationId?: string;
        status?: StatusEnum;
      };

      const updatedProject = await projectService.update(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
        {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(budget !== undefined && { budget }),
          ...(spent !== undefined && { spent }),
          ...(actualStartDate !== undefined && { actualStartDate }),
          ...(actualEndDate !== undefined && { actualEndDate }),
          ...(locationId !== undefined && { locationId }),
          ...(status !== undefined && { status }),
        },
        language,
      );

      if (!updatedProject) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project updated successfully',
        data: updatedProject,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update project';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  submitTask: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { taskId, userId, actualEndDate, taskProgress, images } =
        req.body as {
          taskId?: string;
          userId?: string;
          actualEndDate?: string;
          taskProgress?: number;
          images?: {
            imageId: string;
            description?: string | null;
          }[];
        };

      const taskSubmission = await projectService.submitTask(
        {
          taskId: taskId ?? '',
          userId: userId ?? '',
          actualEndDate: actualEndDate ?? '',
          ...(taskProgress !== undefined && { taskProgress }),
          ...(images !== undefined && { images }),
        },
        req.user!.domainId,
        req.user!.adminId,
        language,
      );

      return res.status(HttpStatus.CREATED).json({
        message: 'Project task submitted successfully',
        data: taskSubmission,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to submit project task';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getTaskSubmissions: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const {
        projectId,
        stageId,
        taskId,
        userId,
        approvalState,
        searchKey,
        offset,
        limit,
      } = req.query as {
        projectId?: string;
        stageId?: string;
        taskId?: string;
        userId?: string;
        approvalState?: 'PENDING' | 'APPROVED' | 'REJECTED';
        searchKey?: string;
        offset?: string;
        limit?: string;
      };

      const { taskSubmissions, pagination } =
        await projectService.getTaskSubmissions(
          req.user!.domainId,
          req.user!.adminId,
          { projectId, stageId, taskId, userId, approvalState, searchKey },
          { offset, limit },
          language,
        );

      return res.status(HttpStatus.OK).json({
        message: 'Project task submissions fetched successfully',
        pagination: {
          currentCount: taskSubmissions.length,
          ...pagination,
        },
        data: taskSubmissions,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch project task submissions';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  actionTaskSubmission: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { ids, action, approvalState } = req.body as {
        ids?: string | string[];
        action?: 'APPROVED' | 'REJECTED' | 'APPROVAL' | 'REJECTION';
        approvalState?: 'APPROVED' | 'REJECTED' | 'APPROVAL' | 'REJECTION';
      };

      const taskSubmissions = await projectService.actionTaskSubmissions(
        ids ?? [],
        action ?? approvalState ?? 'APPROVED',
        req.user!.domainId,
        req.user!.adminId,
        language,
      );

      return res.status(HttpStatus.OK).json({
        message: 'Project task submission action completed successfully',
        data: taskSubmissions,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to action project task submission';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  actionTaskDelay: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { ids, action, approvalState } = req.body as {
        ids?: string | string[];
        action?: 'APPROVED' | 'REJECTED' | 'APPROVAL' | 'REJECTION';
        approvalState?: 'APPROVED' | 'REJECTED' | 'APPROVAL' | 'REJECTION';
      };

      const taskDelays = await projectService.actionTaskDelays(
        ids ?? [],
        action ?? approvalState ?? 'APPROVED',
        req.user!.domainId,
        req.user!.adminId,
      );

      return res.status(HttpStatus.OK).json({
        message: 'Project task delay action completed successfully',
        data: taskDelays,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to action project task delay';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const deletedProject = await projectService.softDelete(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
      );

      if (!deletedProject) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project deleted successfully',
        data: deletedProject,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete project';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
