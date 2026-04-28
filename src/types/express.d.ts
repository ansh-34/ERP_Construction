import 'express-serve-static-core';
import { Multer } from 'multer';
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      name: string;
      email: string;
      role_id: string;
      domain_id: string;
    };
    file?: Multer.File;
  }
}

export {};
