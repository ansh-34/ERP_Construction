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
        projectCategoryId,
        description,
        budget,
        spent,
        locationId,
        status,
      } = req.body as {
        name?: Record<string, unknown>;
        projectCategoryId?: string;
        description?: Record<string, unknown>;
        budget?: number;
        spent?: number;
        locationId?: string;
        status?: StatusEnum;
      };

      const domainId = req.user!.domainId;

      const project = await projectService.create(
        {
          name: name ?? {},
          projectCategoryId: projectCategoryId ?? '',
          ...(description !== undefined && { description }),
          budget: budget ?? 0,
          ...(spent !== undefined && { spent }),
          locationId: locationId ?? '',
          domainId,
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
      const { domainId, searchKey } = req.query as {
        domainId?: string;
        searchKey?: string;
      };
      const projects = await projectService.getAll(
        domainId ?? '',
        searchKey,
        language,
      );

      return res.status(HttpStatus.OK).json({
        message: 'Projects fetched successfully',
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
      const { name, description, budget, spent, status } = req.body as {
        name?: Record<string, unknown>;
        description?: Record<string, unknown> | null;
        budget?: number;
        spent?: number;
        status?: StatusEnum;
      };

      const updatedProject = await projectService.update(
        id ?? '',
        domainId ?? '',
        {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(budget !== undefined && { budget }),
          ...(spent !== undefined && { spent }),
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

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const deletedProject = await projectService.softDelete(
        id ?? '',
        domainId ?? '',
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
