import 'express-serve-static-core';
import { Multer } from 'multer';
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      name: string;
      email: string;
      roleId: string;
      domainId: string;
    };
    file?: Multer.File;
  }
}

export {};
