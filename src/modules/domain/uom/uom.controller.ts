import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { UomService } from './uom.service.js';
import { PaginationQuery } from '@/utils/pagination.js';

export const createUom = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const record = await UomService.create(
      req.user!.domainId,
      req.body,
      language as string,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.UOM.CREATED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.UOM.CREATION_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listUoms = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.headers;
    const { data: uoms, pagination } = await UomService.findAll(
      req.user!.domainId,
      req.query,
      language as string,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.UOM.RETRIEVED,
      pagination: { ...pagination },
      data: uoms,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.UOM.RETRIEVAL_FAILED;
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
      error instanceof Error ? error.message : Messages.UOM.RETRIEVAL_FAILED;
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
      req.body,
      language as string,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.UOM.UPDATED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.UOM.UPDATE_FAILED;
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
      error instanceof Error ? error.message : Messages.UOM.DELETION_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
