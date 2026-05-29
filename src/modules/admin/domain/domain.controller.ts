import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { DomainService } from './domain.service.js';
import variables from '../../../config/variables.config.js';

const getBaseUrl = variables.FRONTEND_URL;

export const seedDomain = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const result = await DomainService.seedDomain(
      req.body,
      req.user!.userId,
      getBaseUrl as string,
      language as string,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.AUTH.SEED_DOMAIN_SUCCESS,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.AUTH.SEEDING_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listDomains = async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const searchKey = req.query.searchKey as string;

    const { totalCount, domains } = await DomainService.listDomains(
      adminId,
      limit,
      offset,
      searchKey,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Domains retrieved successfully',
      pagination: {
        totalCount,
        currentCount: domains.length,
        limit,
        offset,
      },
      data: domains,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to retrieve domains';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getDomainById = async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.userId;
    const { id } = req.params;

    const domain = await DomainService.getDomainById(adminId, id);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Domain retrieved successfully',
      data: domain,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to retrieve domain';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const updateDomain = async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.userId;
    const { id } = req.params;

    const domain = await DomainService.updateDomain(adminId, id, req.body);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Domain updated successfully',
      data: domain,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update domain';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteDomain = async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.userId;
    const { id } = req.params;

    await DomainService.deleteDomain(adminId, id);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Domain deleted successfully',
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete domain';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
