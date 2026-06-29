import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { CostCenterService } from './costCenter.service.js';
import { translateResponse } from '../../../utils/translation.js';

const errorResponse = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  return res
    .status(resolveHttpStatus(message))
    .json({ success: false, message });
};

export const createCostCenter = async (req: Request, res: Response) => {
  try {
    const language = req.headers.language as string | undefined;
    const data = await CostCenterService.create(
      req.user!.domainId,
      req.user!.adminId,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.COST_CENTER.CREATED,
      data: translateResponse(data, language),
    });
  } catch (error) {
    return errorResponse(res, error, Messages.COST_CENTER.CREATE_FAILED);
  }
};

export const listCostCenters = async (req: Request, res: Response) => {
  try {
    const language = req.headers.language as string | undefined;
    const { data, pagination } = await CostCenterService.findAll(
      req.user!.domainId,
      req.user!.adminId,
      req.query,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.COST_CENTER.LIST_RETRIEVED,
      pagination: { currentCount: data.length, ...pagination },
      data: translateResponse(data, language || 'en'),
    });
  } catch (error) {
    return errorResponse(res, error, Messages.COST_CENTER.LIST_FAILED);
  }
};

export const getCostCenterById = async (req: Request, res: Response) => {
  try {
    const language = req.headers.language as string | undefined;
    const data = await CostCenterService.findOne(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.COST_CENTER.RETRIEVED,
      data: translateResponse(data, language),
    });
  } catch (error) {
    return errorResponse(res, error, Messages.COST_CENTER.LIST_FAILED);
  }
};

export const updateCostCenter = async (req: Request, res: Response) => {
  try {
    const language = req.headers.language as string | undefined;
    const data = await CostCenterService.update(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.COST_CENTER.UPDATED,
      data: translateResponse(data, language),
    });
  } catch (error) {
    return errorResponse(res, error, Messages.COST_CENTER.UPDATE_FAILED);
  }
};

export const deleteCostCenter = async (req: Request, res: Response) => {
  try {
    await CostCenterService.softDelete(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.COST_CENTER.DELETED,
      data: null,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.COST_CENTER.DELETE_FAILED);
  }
};
