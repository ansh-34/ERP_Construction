import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { WeighBridgeService } from './weighBridge.service.js';

export const createWeighBridge = async (req: Request, res: Response) => {
  try {
    const record = await WeighBridgeService.create(
      req.user!.domainId,
      req.user!.adminId,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.WEIGH_BRIDGE.CREATED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.WEIGH_BRIDGE.CREATE_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const listWeighBridges = async (req: Request, res: Response) => {
  try {
    // User module returns the raw name object unless a `lang` header is passed.
    const lang = (req.headers.lang as string) || null;
    const { data, pagination } = await WeighBridgeService.findAll(
      req.user!.domainId,
      req.user!.adminId,
      req.query as PaginationQuery,
      lang,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.WEIGH_BRIDGE.LIST_RETRIEVED,
      pagination: { currentCount: data.length, ...pagination },
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.WEIGH_BRIDGE.LIST_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const getWeighBridgeById = async (req: Request, res: Response) => {
  try {
    // User module returns the raw name object unless a `lang` header is passed.
    const lang = (req.headers.lang as string) || null;
    const record = await WeighBridgeService.findOne(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
      lang,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.WEIGH_BRIDGE.RETRIEVED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.WEIGH_BRIDGE.NOT_FOUND;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const updateWeighBridge = async (req: Request, res: Response) => {
  try {
    const record = await WeighBridgeService.update(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.WEIGH_BRIDGE.UPDATED,
      data: record,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.WEIGH_BRIDGE.UPDATE_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const deleteWeighBridge = async (req: Request, res: Response) => {
  try {
    await WeighBridgeService.softDelete(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.WEIGH_BRIDGE.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.WEIGH_BRIDGE.DELETE_FAILED;
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};
