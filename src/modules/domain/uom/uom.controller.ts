import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { UomService } from './uom.service.js';

export const createUom = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const record = await UomService.create(
      req.user!.domainId,
      req.body as any,
      language as string,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.UOM.CREATED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create UOM';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listUoms = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const result = await UomService.findAll(
      req.user!.domainId,
      req.query as any,
      language as string,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.UOM.RETRIEVED,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to retrieve UOMs';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getUomById = async (req: Request, res: Response) => {
  try {
    const { language } = req.headers;
    const record = await UomService.findOne(
      req.user!.domainId,
      req.params.id,
      language as string | null,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.UOM.RETRIEVED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to retrieve UOM';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const updateUom = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const record = await UomService.update(
      req.user!.domainId,
      req.params.id,
      req.body as any,
      language as string,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.UOM.UPDATED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update UOM';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteUom = async (req: Request, res: Response) => {
  try {
    await UomService.softDelete(req.user!.domainId, req.params.id);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.UOM.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete UOM';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
