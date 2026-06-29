import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { IndustryAccountCategoryService } from './industryAccountCategory.service.js';

const language = (req: Request) => (req.headers.language as string) || 'en';
const failure = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  return res
    .status(resolveHttpStatus(message))
    .json({ success: false, message });
};

export const createIndustryAccountCategory = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await IndustryAccountCategoryService.create(
      req.body,
      language(req),
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Industry account category created successfully',
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to create industry account category');
  }
};

export const listIndustryAccountCategories = async (
  req: Request,
  res: Response,
) => {
  try {
    const { data, pagination } = await IndustryAccountCategoryService.list(
      req.query,
      language(req),
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Industry account categories retrieved successfully',
      pagination: { currentCount: data.length, ...pagination },
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to list industry account categories');
  }
};

export const getIndustryAccountCategory = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await IndustryAccountCategoryService.getById(
      req.params.id,
      language(req),
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Industry account category retrieved successfully',
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to get industry account category');
  }
};

export const updateIndustryAccountCategory = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await IndustryAccountCategoryService.update(
      req.params.id,
      req.body,
      language(req),
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Industry account category updated successfully',
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to update industry account category');
  }
};

export const deleteIndustryAccountCategory = async (
  req: Request,
  res: Response,
) => {
  try {
    await IndustryAccountCategoryService.delete(req.params.id);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Industry account category deleted successfully',
      data: null,
    });
  } catch (error) {
    return failure(res, error, 'Failed to delete industry account category');
  }
};
