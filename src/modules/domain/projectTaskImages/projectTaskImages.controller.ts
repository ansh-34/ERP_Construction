import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { resolveHttpStatus } from '@/utils/httpError';
import { projectTaskImagesService } from './projectTaskImages.service';

export const projectTaskImagesController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { imageId, description, taskId } = req.body as {
        imageId?: string;
        description?: string | null;
        taskId?: string;
      };

      const projectTaskImage = await projectTaskImagesService.create({
        imageId: imageId ?? '',
        ...(description !== undefined && { description }),
        taskId: taskId ?? '',
        domainId: req.user!.domainId,
        adminId: req.user!.adminId,
      });

      return res.status(HttpStatus.CREATED).json({
        message: 'Project task image created successfully',
        data: projectTaskImage,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create project task image';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { taskId, offset, limit } = req.query as {
        taskId?: string;
        offset?: string;
        limit?: string;
      };

      const { projectTaskImages, pagination } =
        await projectTaskImagesService.getAll(
          req.user!.domainId,
          req.user!.adminId,
          taskId,
          { offset, limit },
        );

      return res.status(HttpStatus.OK).json({
        message: 'Project task images fetched successfully',
        pagination: {
          currentCount: projectTaskImages.length,
          ...pagination,
        },
        data: projectTaskImages,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch project task images';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };

      const deletedProjectTaskImage = await projectTaskImagesService.softDelete(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
      );

      if (!deletedProjectTaskImage) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Project task image deleted successfully',
        data: deletedProjectTaskImage,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete project task image';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
