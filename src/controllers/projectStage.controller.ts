import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { StatusEnum } from '@constants/index';
import { projectStageService } from '@/services';
import { resolveHttpStatus } from '@/utils/httpError';

export const projectStageController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, description, progress, projectId, domainId, status } =
        req.body as {
          name?: Record<string, unknown>;
          description?: Record<string, unknown> | null;
          progress?: number | null;
          projectId?: string;
          domainId?: string;
          status?: StatusEnum;
        };

      const projectStage = await projectStageService.create({
        name: name ?? {},
        ...(description !== undefined && { description }),
        ...(progress !== undefined && { progress }),
        projectId: projectId ?? '',
        domainId: domainId ?? '',
        status: status ?? StatusEnum.ACTIVE,
      });

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
      const { domainId, projectId } = req.query as {
        domainId?: string;
        projectId?: string;
      };
      const projectStages = await projectStageService.getAll(
        domainId ?? '',
        projectId ?? '',
      );

      return res.status(HttpStatus.OK).json({
        message: 'Project stages fetched successfully',
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
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const projectStage = await projectStageService.getById(
        id ?? '',
        domainId ?? '',
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
      const { name, description, progress, status } = req.body as {
        name?: Record<string, unknown>;
        description?: Record<string, unknown> | null;
        progress?: number | null;
        status?: StatusEnum;
      };

      const updatedProjectStage = await projectStageService.update(
        id ?? '',
        domainId ?? '',
        {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(progress !== undefined && { progress }),
          ...(status !== undefined && { status }),
        },
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
