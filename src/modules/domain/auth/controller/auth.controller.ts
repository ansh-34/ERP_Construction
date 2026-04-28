import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import { HttpStatus, Messages } from '@constants/index';

export const login = async (req: Request, res: Response) => {
  try {
    const data = await AuthService.login(req.body);

    return res.status(HttpStatus.OK).json({
      success: true,
      data,
      message: Messages.AUTH.LOGIN_SUCCESS,
    });
  } catch (error: any) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  try {
    const data = await AuthService.userLogin(req.body);

    return res.status(HttpStatus.OK).json({
      success: true,
      data,
      message: Messages.AUTH.LOGIN_SUCCESS,
    });
  } catch (error: any) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};
