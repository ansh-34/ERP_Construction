import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { IndustryRoleTemplateService } from './industryRoleTemplate.service.js';

export const createIndustryRoleTemplate = async (
  req: Request,
  res: Response,
) => {
  try {
    const adminId = req.user?.userId;
    const { language = 'en' } = req.headers;
    const template = await IndustryRoleTemplateService.create(
      adminId!,
      req.body,
      language as string,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Industry role template created successfully',
      data: template,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to create industry role template';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const bulkCreateIndustryRoleTemplates = async (
  req: Request,
  res: Response,
) => {
  try {
    const adminId = req.user?.userId;
    const { language = 'en' } = req.headers;
    const result = await IndustryRoleTemplateService.bulkCreate(
      adminId!,
      req.body,
      language as string,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Industry role templates created successfully',
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to create industry role templates';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const listIndustryRoleTemplates = async (
  req: Request,
  res: Response,
) => {
  try {
    const adminId = req.user?.userId;
    const { language = 'en' } = req.headers;
    const { templates, pagination } = await IndustryRoleTemplateService.list(
      adminId!,
      req.query,
      language as string,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Industry role templates retrieved successfully',
      pagination: {
        currentCount: templates.length,
        ...pagination,
      },
      data: templates,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to list industry role templates';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const getIndustryRoleTemplate = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.userId;
    const { language = 'en' } = req.headers;
    const template = await IndustryRoleTemplateService.getById(
      adminId!,
      req.params.id,
      language as string,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Industry role template retrieved successfully',
      data: template,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to get industry role template';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const updateIndustryRoleTemplate = async (
  req: Request,
  res: Response,
) => {
  try {
    const adminId = req.user?.userId;
    const { language = 'en' } = req.headers;
    const template = await IndustryRoleTemplateService.update(
      adminId!,
      req.params.id,
      req.body,
      language as string,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Industry role template updated successfully',
      data: template,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to update industry role template';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};

export const deleteIndustryRoleTemplate = async (
  req: Request,
  res: Response,
) => {
  try {
    const adminId = req.user?.userId;
    await IndustryRoleTemplateService.delete(adminId!, req.params.id);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Industry role template deleted successfully',
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to delete industry role template';
    return res
      .status(resolveHttpStatus(message))
      .json({ success: false, message });
  }
};
