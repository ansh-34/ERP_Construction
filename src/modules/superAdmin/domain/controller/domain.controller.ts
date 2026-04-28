import { Request, Response } from 'express';
import { DomainService } from '../service/domain.service';
import { HttpStatus, Messages, StatusEnum } from '@constants/index';

export const addDomain = async (req: Request, res: Response) => {
  try {
    const { name, email, password, roleId } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      roleId?: string;
    };

    const domain = await DomainService.addDomain({
      name: name ?? '',
      email: email ?? '',
      password: password ?? '',
      roleId: roleId ?? '',
    });

    return res.status(HttpStatus.CREATED).json({
      success: true,
      data: domain,
      message: Messages.DOMAIN.CREATED,
    });
  } catch (error: any) {
    console.error('Error adding domain:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDomain = async (req: Request, res: Response) => {
  try {
    const domainId = req.params.id as string;
    const { name, status } = req.body as {
      name?: string;
      status?: StatusEnum;
    };

    const domain = await DomainService.editDomain(domainId, {
      ...(name !== undefined && { name }),
      ...(status !== undefined && { status }),
    });

    return res.status(HttpStatus.OK).json({
      success: true,
      data: domain,
      message: Messages.DOMAIN.UPDATED,
    });
  } catch (error: any) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeDomain = async (req: Request, res: Response) => {
  try {
    const domainId = req.params.id as string;
    const domain = await DomainService.removeDomain(domainId);

    return res.status(HttpStatus.OK).json({
      success: true,
      data: domain,
      message: Messages.DOMAIN.DELETED,
    });
  } catch (error: any) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export const listDomains = async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const domains = await DomainService.listDomains(query);

    return res.status(HttpStatus.OK).json({
      success: true,
      data: domains,
    });
  } catch (error: any) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDomain = async (req: Request, res: Response) => {
  try {
    const domainId = req.params.id as string;
    const domain = await DomainService.getDomain(domainId);

    return res.status(HttpStatus.OK).json({
      success: true,
      data: domain,
    });
  } catch (error: any) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};
