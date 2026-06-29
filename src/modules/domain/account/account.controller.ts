import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { AccountService } from './account.service.js';

const errorResponse = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  return res
    .status(resolveHttpStatus(message))
    .json({ success: false, message });
};

export const createAccount = async (req: Request, res: Response) => {
  try {
    const data = await AccountService.create(
      req.user!.domainId,
      req.user!.adminId,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.ACCOUNT.CREATED,
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.ACCOUNT.CREATE_FAILED);
  }
};

export const listAccounts = async (req: Request, res: Response) => {
  try {
    const { data, pagination } = await AccountService.findAll(
      req.user!.domainId,
      req.user!.adminId,
      req.query,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ACCOUNT.LIST_RETRIEVED,
      pagination: { currentCount: data.length, ...pagination },
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.ACCOUNT.LIST_FAILED);
  }
};

export const getAccountById = async (req: Request, res: Response) => {
  try {
    const data = await AccountService.findOne(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ACCOUNT.RETRIEVED,
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.ACCOUNT.LIST_FAILED);
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const data = await AccountService.update(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ACCOUNT.UPDATED,
      data,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.ACCOUNT.UPDATE_FAILED);
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    await AccountService.softDelete(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ACCOUNT.DELETED,
      data: null,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.ACCOUNT.DELETE_FAILED);
  }
};
