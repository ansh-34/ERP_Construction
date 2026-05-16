import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { mediaService } from './media.service';
import { resolveHttpStatus } from '@/utils/httpError';
import { deleteFromS3, uploadToS3 } from '@/utils/s3.utils';

export const mediaController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const domainId = req.user!.domainId;
      const adminId = req.user!.adminId;
      const { file } = req;
      const { name } = req.body as {
        name?: Record<string, unknown>;
      };

      if (!file) {
        throw new Error('invalid file');
      }

      const url = await uploadToS3(file, 'media');
      let media;

      try {
        media = await mediaService.create(
          {
            name: name ?? { en: file.originalname },
            type: file.mimetype,
            url,
            domainId,
            adminId,
          },
          language,
        );
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
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { domainId, searchKey } = req.query as {
        domainId?: string;
        searchKey?: string;
      };
      const adminId = req.user!.adminId;
      const media = await mediaService.getAll(
        domainId ?? '',
        adminId,
        searchKey,
        language,
      );

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
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const adminId = req.user!.adminId;
      const media = await mediaService.getById(
        id ?? '',
        domainId ?? '',
        adminId,
        language,
      );

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
      const adminId = req.user!.adminId;
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { name, type } = req.body as {
        name?: Record<string, unknown>;
        type?: string;
      };

      const updatedMedia = await mediaService.update(
        id ?? '',
        domainId ?? '',
        adminId,
        {
          ...(name !== undefined && { name }),
          ...(type !== undefined && { type }),
        },
        language,
      );

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
      const adminId = req.user!.adminId;
      const deletedMedia = await mediaService.softDelete(
        id ?? '',
        domainId ?? '',
        adminId,
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
