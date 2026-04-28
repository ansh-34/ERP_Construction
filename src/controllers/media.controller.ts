import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { mediaService } from '@/services';
import { resolveHttpStatus } from '@/utils/httpError';
import { deleteFromS3, uploadToS3 } from '@/utils/s3.utils';

export const mediaController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { domainId } = req.body as {
        domainId?: string;
      };
      const { file } = req;

      if (!file) {
        throw new Error('invalid file');
      }

      const url = await uploadToS3(file, 'media');
      let media;

      try {
        media = await mediaService.create({
          name: file.originalname,
          type: file.mimetype,
          url,
          domainId: domainId ?? '',
        });
      } catch (error: unknown) {
        await deleteFromS3(url);
        throw error;
      }

      return res.status(HttpStatus.CREATED).json({
        message: 'Media created successfully',
        data: media,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to create media';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { domainId } = req.query as { domainId?: string };
      const media = await mediaService.getAll(domainId ?? '');

      return res.status(HttpStatus.OK).json({
        message: 'Media fetched successfully',
        data: media,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch media';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getById: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const media = await mediaService.getById(id ?? '', domainId ?? '');

      if (!media) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Media fetched successfully',
        data: media,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch media';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const { name, type } = req.body as {
        name?: string;
        type?: string;
      };

      const updatedMedia = await mediaService.update(id ?? '', domainId ?? '', {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
      });

      if (!updatedMedia) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Media updated successfully',
        data: updatedMedia,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update media';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const deletedMedia = await mediaService.softDelete(
        id ?? '',
        domainId ?? '',
      );

      if (!deletedMedia) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Media deleted successfully',
        data: deletedMedia,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete media';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
