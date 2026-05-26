import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { StatusEnum } from '@constants/index';
import { resolveHttpStatus } from '@/utils/httpError';
import { machineryService } from './machinery.service';

export const machineryController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { code, type, expectedLitrePerHour, projectId, status } =
        req.body as {
          code?: string;
          type?: string;
          expectedLitrePerHour?: number;
          projectId?: string;
          status?: StatusEnum;
        };

      const domainId = req.user!.domainId;
      const adminId = req.user!.adminId;

      const machinery = await machineryService.create(
        {
          code: code ?? '',
          type: type ?? '',
          ...(expectedLitrePerHour !== undefined && { expectedLitrePerHour }),
          projectId: projectId ?? '',
          domainId,
          adminId,
          status: status ?? StatusEnum.ACTIVE,
        },
        language,
      );

      return res.status(HttpStatus.CREATED).json({
        message: 'Machinery created successfully',
        data: machinery,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to create machinery';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language =
        (req.body as { language?: string }).language ||
        (req.headers.language as string) ||
        'en';
      const { domainId, projectId, searchKey } = req.query as {
        domainId?: string;
        projectId?: string;
        searchKey?: string;
      };

      const machineries = await machineryService.getAll(
        domainId ?? '',
        req.user!.adminId,
        projectId,
        searchKey,
        language,
      );

      return res.status(HttpStatus.OK).json({
        message: 'Machineries fetched successfully',
        data: machineries,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch machineries';
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
      const machinery = await machineryService.getById(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
        language,
      );

      if (!machinery) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Machinery fetched successfully',
        data: machinery,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch machinery';
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
      const { code, type, expectedLitrePerHour, status } = req.body as {
        code?: string;
        type?: string;
        expectedLitrePerHour?: number;
        status?: StatusEnum;
      };

      const updatedMachinery = await machineryService.update(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
        {
          ...(code !== undefined && { code }),
          ...(type !== undefined && { type }),
          ...(expectedLitrePerHour !== undefined && {
            expectedLitrePerHour,
          }),
          ...(status !== undefined && { status }),
        },
        language,
      );

      if (!updatedMachinery) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Machinery updated successfully',
        data: updatedMachinery,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update machinery';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const deletedMachinery = await machineryService.softDelete(
        id ?? '',
        domainId ?? '',
        req.user!.adminId,
      );

      if (!deletedMachinery) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Machinery deleted successfully',
        data: deletedMachinery,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete machinery';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
