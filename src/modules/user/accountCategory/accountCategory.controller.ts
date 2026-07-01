import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { AccountCategoryService } from './accountCategory.service.js';
import { translateResponse } from '../../../utils/translation.js';

const errorResponse = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  return res
    .status(resolveHttpStatus(message))
    .json({ success: false, message });
};

export const createAccountCategory = async (req: Request, res: Response) => {
  try {
    const language = req.headers.language as string | undefined;
    const data = await AccountCategoryService.create(
      req.user!.domainId,
      req.user!.adminId,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.ACCOUNT_CATEGORY.CREATED,
      data: translateResponse(data, language),
    });
  } catch (error) {
    return errorResponse(res, error, Messages.ACCOUNT_CATEGORY.CREATE_FAILED);
  }
};

export const listAccountCategories = async (req: Request, res: Response) => {
  try {
    const language = req.headers.language as string | undefined;
    const { data, pagination } = await AccountCategoryService.findAll(
      req.user!.domainId,
      req.user!.adminId,
      req.query,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ACCOUNT_CATEGORY.LIST_RETRIEVED,
      pagination: { currentCount: data.length, ...pagination },
      data: translateResponse(data, language),
    });
  } catch (error) {
    return errorResponse(res, error, Messages.ACCOUNT_CATEGORY.LIST_FAILED);
  }
};

export const getAccountCategoryById = async (req: Request, res: Response) => {
  try {
    const language = req.headers.language as string | undefined;
    const data = await AccountCategoryService.findOne(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ACCOUNT_CATEGORY.RETRIEVED,
      data: translateResponse(data, language),
    });
  } catch (error) {
    return errorResponse(res, error, Messages.ACCOUNT_CATEGORY.LIST_FAILED);
  }
};

export const updateAccountCategory = async (req: Request, res: Response) => {
  try {
    const language = req.headers.language as string | undefined;
    const data = await AccountCategoryService.update(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ACCOUNT_CATEGORY.UPDATED,
      data: translateResponse(data, language),
    });
  } catch (error) {
    return errorResponse(res, error, Messages.ACCOUNT_CATEGORY.UPDATE_FAILED);
  }
};

export const deleteAccountCategory = async (req: Request, res: Response) => {
  try {
    await AccountCategoryService.softDelete(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ACCOUNT_CATEGORY.DELETED,
      data: null,
    });
  } catch (error) {
    return errorResponse(res, error, Messages.ACCOUNT_CATEGORY.DELETE_FAILED);
  }
};
