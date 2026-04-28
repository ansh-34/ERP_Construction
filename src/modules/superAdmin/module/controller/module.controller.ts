import { Request, Response } from 'express';
import { ModuleService } from '../service/module.service';

export const addModule = async (req: Request, res: Response) => {
  try {
    const module = await ModuleService.addModule(req.body);

    return res.status(200).json({
      success: true,
      data: module,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const editModule = async (req: Request, res: Response) => {
  try {
    const moduleId = req.params.id as string;
    const module = await ModuleService.editModule(moduleId, req.body);

    return res.status(200).json({
      success: true,
      data: module,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeModule = async (req: Request, res: Response) => {
  try {
    const module_id = req.params.id as string;
    const module = await ModuleService.removeModule(module_id);

    return res.status(200).json({
      success: true,
      data: module,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const listModules = async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const result = await ModuleService.listModules(query);

    return res.status(200).json({
      success: true,
      data: result.modules,
      totalCount: result.totalCount,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};
