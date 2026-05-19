import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { AdminService } from './admin.service.js';

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const data = await AdminService.createAdmin(req.body);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ADMIN.INVITED,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.ADMIN.INVITE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listAdmins = async (req: Request, res: Response) => {
  try {
    const { admins, pagination } = await AdminService.listAdmins(req.query);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ADMIN.RETRIEVED,
      data: admins,
      pagination,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.ADMIN.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getAdmin = async (req: Request, res: Response) => {
  try {
    const { language } = req.headers;
    const data = await AdminService.getAdmin(req.params.id, language as string);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ADMIN.RETRIEVED,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.ADMIN.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const data = await AdminService.updateAdmin(req.params.id, req.body);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.ADMIN.UPDATED,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.ADMIN.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    await AdminService.deleteAdmin(req.params.id);

    return res.status(HttpStatus.NO_CONTENT).json({
      success: true,
      message: Messages.ADMIN.DELETED,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.ADMIN.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
