import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { StatusEnum } from '@constants/index';
import { locationService } from './location.service';
import { resolveHttpStatus } from '@/utils/httpError';

export const locationController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, type, parentLocationId, domainId, status } = req.body as {
        name?: Record<string, unknown>;
        type?: string;
        parentLocationId?: string | null;
        domainId?: string;
        status?: StatusEnum;
      };

      const location = await locationService.create({
        name: name ?? {},
        type: type ?? '',
        ...(parentLocationId !== undefined && { parentLocationId }),
        domainId: domainId ?? '',
        status: status ?? StatusEnum.ACTIVE,
      });

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
      const { domainId } = req.query as { domainId?: string };
      const locations = await locationService.getAll(domainId ?? '');

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
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const location = await locationService.getById(id ?? '', domainId ?? '');

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
      const { domainId } = req.query as { domainId?: string };
      const { name, type, parentLocationId, status } = req.body as {
        name?: Record<string, unknown>;
        type?: string;
        parentLocationId?: string | null;
        status?: StatusEnum;
      };

      const updatedLocation = await locationService.update(
        id ?? '',
        domainId ?? '',
        {
          ...(name !== undefined && { name }),
          ...(type !== undefined && { type }),
          ...(parentLocationId !== undefined && { parentLocationId }),
          ...(status !== undefined && { status }),
        },
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
      const { domainId } = req.query as { domainId?: string };
      const deletedLocation = await locationService.softDelete(
        id ?? '',
        domainId ?? '',
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
