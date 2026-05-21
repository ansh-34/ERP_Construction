import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { StatusEnum } from '@constants/index';
import { projectStageService } from './projectStage.service';
import { resolveHttpStatus } from '@/utils/httpError';

export const projectStageController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { name, description, progress, projectId, domainId, status } =
        req.body as {
          name?: Record<string, unknown>;
          description?: Record<string, unknown> | null;
          progress?: number | null;
          projectId?: string;
          domainId?: string;
          status?: StatusEnum;
        };

      const projectStage = await projectStageService.create(
        {
          name: name ?? {},
          ...(description !== undefined && { description }),
          ...(progress !== undefined && { progress }),
          ...(projectId !== undefined && { projectId }),
          domainId: domainId ?? '',
          adminId: req.user!.adminId,
          status: status ?? StatusEnum.ACTIVE,
        },
        language,
      );

      return res.status(HttpStatus.CREATED).json({
        message: 'Project stage created successfully',
        data: projectStage,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create project stage';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { domainId, projectId, searchKey, offset, limit } = req.query as {
        domainId?: string;
        projectId?: string;
        searchKey?: string;
        offset?: string;
        limit?: string;
      };
      const { projectStages, pagination } = await projectStageService.getAll(
        domainId ?? '',
        req.user!.adminId,
        projectId ?? '',
        searchKey,
        { offset, limit },
        language,
      );

      return res.status(HttpStatus.OK).json({
        message: 'Project stages fetched successfully',
        pagination: {
          currentCount: projectStages.length,
          ...pagination,
        },
        data: projectStages,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch project stages';
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
      const projectStage = await projectStageService.getById(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
        language,
      );

      if (!projectStage) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project stage fetched successfully',
        data: projectStage,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch project stage';
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
      const { name, description, progress, status } = req.body as {
        name?: Record<string, unknown>;
        description?: Record<string, unknown> | null;
        progress?: number | null;
        status?: StatusEnum;
      };

      const updatedProjectStage = await projectStageService.update(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
        {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(progress !== undefined && { progress }),
          ...(status !== undefined && { status }),
        },
        language,
      );

      if (!updatedProjectStage) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project stage updated successfully',
        data: updatedProjectStage,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update project stage';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const deletedProjectStage = await projectStageService.softDelete(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
      );

      if (!deletedProjectStage) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project stage deleted successfully',
        data: deletedProjectStage,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete project stage';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
