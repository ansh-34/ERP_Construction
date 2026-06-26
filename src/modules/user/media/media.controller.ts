import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { resolveHttpStatus } from '@/utils/httpError';
import { deleteFromS3, uploadToS3 } from '@/utils/s3.utils';
import { mediaService } from './media.service';
import type { MediaCategory } from '@repositories/index';

const getUploadedFiles = (req: Request): Express.Multer.File[] => {
  if (!req.files) {
    return [];
  }

  if (Array.isArray(req.files)) {
    return req.files;
  }

  return [...(req.files.files ?? []), ...(req.files.file ?? [])];
};

const getUploadedNames = (names?: string | string[]): string[] => {
  if (names === undefined) {
    return [];
  }

  return Array.isArray(names) ? names : [names];
};

export const mediaController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const domainId = req.user!.domainId;
      const adminId = req.user!.adminId;
      const files = getUploadedFiles(req);
      const { name, names } = req.body as {
        name?: string;
        names?: string | string[];
      };
      const uploadedNames = getUploadedNames(names);

      if (files.length === 0) {
        throw new Error('invalid files');
      }

      if (uploadedNames.length > files.length) {
        throw new Error('invalid names');
      }

      const uploadedUrls: string[] = [];
      const media: Awaited<ReturnType<typeof mediaService.create>>[] = [];

      try {
        for (const [index, file] of files.entries()) {
          const url = await uploadToS3(file, `media/${adminId}/${domainId}`);
          uploadedUrls.push(url);
          media.push(
            await mediaService.create(
              {
                name:
                  uploadedNames[index] ??
                  (files.length === 1 && name ? name : file.originalname),
                type: file.mimetype,
                url,
                domainId,
                adminId,
              },
              language,
            ),
          );
        }
      } catch (error: unknown) {
        await Promise.allSettled([
          ...media.map((item) =>
            mediaService.softDelete(item.id, domainId, adminId),
          ),
          ...uploadedUrls.map((url) => deleteFromS3(url)),
        ]);
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
        null;
      const { searchKey, type, category } = req.query as {
        searchKey?: string;
        type?: string;
        category?: MediaCategory;
      };

      const media = await mediaService.getAll(
        req.user!.domainId,
        req.user!.adminId,
        searchKey,
        language,
        type,
        category,
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
      const media = await mediaService.getById(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
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
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { name, type } = req.body as {
        name?: string;
        type?: string;
      };

      const updatedMedia = await mediaService.update(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
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
      const deletedMedia = await mediaService.softDelete(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
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
