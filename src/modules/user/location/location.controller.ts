import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { StatusEnum } from '@constants/index';
import { resolveHttpStatus } from '@/utils/httpError';
import { locationService } from './location.service';

export const locationController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { name, code, type, parentLocationId, status } = req.body as {
        name?: Record<string, unknown>;
        code?: string;
        type?: string;
        parentLocationId?: string | null;
        status?: StatusEnum;
      };

      const location = await locationService.create(
        {
          name: name ?? {},
          ...(code !== undefined && { code }),
          type: type ?? '',
          ...(parentLocationId !== undefined && { parentLocationId }),
          domainId: req.user!.domainId,
          adminId: req.user!.adminId,
          status: status ?? StatusEnum.ACTIVE,
        },
        language,
      );

      return res.status(HttpStatus.CREATED).json({
        message: 'Location created successfully',
        data: location,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to create location';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { searchKey } = req.query as { searchKey?: string };

      const locations = await locationService.getAll(
        req.user!.domainId,
        req.user!.adminId,
        searchKey,
        language,
      );

      return res.status(HttpStatus.OK).json({
        message: 'Locations fetched successfully',
        data: locations,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch locations';
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

      const location = await locationService.getById(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
        language,
      );

      if (!location) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Location fetched successfully',
        data: location,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch location';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { name, code, type, parentLocationId, status } = req.body as {
        name?: Record<string, unknown>;
        code?: string;
        type?: string;
        parentLocationId?: string | null;
        status?: StatusEnum;
      };

      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const updatedLocation = await locationService.update(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
        {
          ...(name !== undefined && { name }),
          ...(code !== undefined && { code }),
          ...(type !== undefined && { type }),
          ...(parentLocationId !== undefined && { parentLocationId }),
          ...(status !== undefined && { status }),
        },
        language,
      );

      if (!updatedLocation) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Location updated successfully',
        data: updatedLocation,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update location';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const deletedLocation = await locationService.softDelete(
        id ?? '',
        req.user!.domainId,
        req.user!.adminId,
      );

      if (!deletedLocation) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Location deleted successfully',
        data: deletedLocation,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete location';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
