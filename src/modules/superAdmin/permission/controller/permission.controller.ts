import { Request, Response } from 'express';
import { PermissionService } from '../service/permission.service';
import { StatusEnum } from '@constants/index';

export const addPermission = async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name?: string };

    const permission = await PermissionService.addPermission({
      name: name ?? '',
    });

    return res.status(200).json({
      success: true,
      data: permission,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const editPermission = async (req: Request, res: Response) => {
  try {
    const permissionId = req.params.id as string;
    const { name, status } = req.body as {
      name?: string;
      status?: StatusEnum;
    };

    const permission = await PermissionService.editPermission(permissionId, {
      ...(name !== undefined && { name }),
      ...(status !== undefined && { status }),
    });

    return res.status(200).json({
      success: true,
      data: permission,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const removePermission = async (req: Request, res: Response) => {
  try {
    const permissionId = req.params.id as string;
    const permission = await PermissionService.removePermission(permissionId);

    return res.status(200).json({
      success: true,
      message: 'Permission removed successfully',
      data: permission,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const listPermissions = async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const result = await PermissionService.listPermissions(query);

    return res.status(200).json({
      success: true,
      data: result.permissions,
      totalCount: result.totalCount,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};
