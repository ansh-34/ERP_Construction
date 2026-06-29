import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { IndustryAccountService } from './industryAccount.service.js';

const language = (req: Request) => (req.headers.language as string) || 'en';
const failure = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  return res
    .status(resolveHttpStatus(message))
    .json({ success: false, message });
};

export const createIndustryAccount = async (req: Request, res: Response) => {
  try {
    const data = await IndustryAccountService.create(req.body, language(req));
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Industry account created successfully',
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to create industry account');
  }
};

export const listIndustryAccounts = async (req: Request, res: Response) => {
  try {
    const { data, pagination } = await IndustryAccountService.list(
      req.query,
      language(req),
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Industry accounts retrieved successfully',
      pagination: { currentCount: data.length, ...pagination },
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to list industry accounts');
  }
};

export const getIndustryAccount = async (req: Request, res: Response) => {
  try {
    const data = await IndustryAccountService.getById(
      req.params.id,
      language(req),
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Industry account retrieved successfully',
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to get industry account');
  }
};

export const updateIndustryAccount = async (req: Request, res: Response) => {
  try {
    const data = await IndustryAccountService.update(
      req.params.id,
      req.body,
      language(req),
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Industry account updated successfully',
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to update industry account');
  }
};

export const deleteIndustryAccount = async (req: Request, res: Response) => {
  try {
    await IndustryAccountService.delete(req.params.id);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Industry account deleted successfully',
      data: null,
    });
  } catch (error) {
    return failure(res, error, 'Failed to delete industry account');
  }
};
