declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        domainId: string;
        roleId: string | null;
        industry: string;
      };
    }
  }
}

export {};
