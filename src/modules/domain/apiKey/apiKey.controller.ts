import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/httpStatus';
import { apiKeyService } from './apiKey.service';
import { resolveHttpStatus } from '../../../utils/httpError';

export const apiKeyController = {
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, description, domainId } = req.body as {
        name?: string;
        description?: string;
        domainId?: string;
      };

      const apiKey = await apiKeyService.create({
        name: name ?? '',
        description: description ?? '',
        domainId: domainId ?? '',
      });

      return res.status(HttpStatus.CREATED).json({
        message: 'Api key created successfully',
        data: apiKey,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create api key';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { domainId } = req.query as { domainId?: string };
      const apiKeys = await apiKeyService.getAll(domainId ?? '');

      return res.status(HttpStatus.OK).json({
        message: 'Api keys fetched successfully',
        data: apiKeys,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch api keys';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  getById: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const apiKey = await apiKeyService.getById(id ?? '', domainId ?? '');

      if (!apiKey) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Api key fetched successfully',
        data: apiKey,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch api key';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const { name, description } = req.body as { name?: string; description?: string };

      const updatedApiKey = await apiKeyService.update(id ?? '', domainId ?? '', {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      });

      if (!updatedApiKey) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Api key updated successfully',
        data: updatedApiKey,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update api key';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { domainId } = req.query as { domainId?: string };
      const deletedApiKey = await apiKeyService.delete(id ?? '', domainId ?? '');

      if (!deletedApiKey) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'not found' });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Api key deleted successfully',
        data: deletedApiKey,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete api key';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};