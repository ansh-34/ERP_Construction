import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { StatusEnum } from '@constants/index';
import { projectCategoryService } from './projectCategory.service';
import { resolveHttpStatus } from '@/utils/httpError';

export const projectCategoryController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { name, description, domainId, status } = req.body as {
        name?: Record<string, unknown>;
        description?: string | null;
        domainId?: string;
        status?: StatusEnum;
      };

      const projectCategory = await projectCategoryService.create(
        {
          name: name ?? {},
          ...(description !== undefined && { description }),
          domainId: domainId ?? '',
          status: status ?? StatusEnum.ACTIVE,
        },
        language,
      );

      return res.status(HttpStatus.CREATED).json({
        message: 'Project category created successfully',
        data: projectCategory,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create project category';
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
      const projectCategories = await projectCategoryService.getAll(
        domainId ?? '',
        searchKey,
        language,
      );

      return res.status(HttpStatus.OK).json({
        message: 'Project categories fetched successfully',
        data: projectCategories,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch project categories';
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
      const projectCategory = await projectCategoryService.getById(
        id ?? '',
        domainId ?? '',
        language,
      );

      if (!projectCategory) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project category fetched successfully',
        data: projectCategory,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch project category';
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
      const { name, description, status } = req.body as {
        name?: Record<string, unknown>;
        description?: string | null;
        status?: StatusEnum;
      };

      const updatedProjectCategory = await projectCategoryService.update(
        id ?? '',
        domainId ?? '',
        {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status }),
        },
        language,
      );

      if (!updatedProjectCategory) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project category updated successfully',
        data: updatedProjectCategory,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update project category';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const deletedProjectCategory = await projectCategoryService.softDelete(
        id ?? '',
        domainId ?? '',
      );

      if (!deletedProjectCategory) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project category deleted successfully',
        data: deletedProjectCategory,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete project category';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
