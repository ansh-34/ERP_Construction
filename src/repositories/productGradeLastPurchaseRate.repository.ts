import prisma from '../infra/database/prisma/prisma.client.js';

export const ProductGradeLastPurchaseRateRepository = {
  findFirst(args: any, tx?: any): Promise<any> {
    const client = tx || prisma;
    return client.productGradeLastPurchaseRate.findFirst(args) as Promise<any>;
  },

  findMany(args: any, tx?: any): Promise<any> {
    const client = tx || prisma;
    return client.productGradeLastPurchaseRate.findMany(args) as Promise<any>;
  },

  count(args: any, tx?: any): Promise<any> {
    const client = tx || prisma;
    return client.productGradeLastPurchaseRate.count(args) as Promise<any>;
  },

  updateMany(args: any, tx?: any): Promise<any> {
    const client = tx || prisma;
    return client.productGradeLastPurchaseRate.updateMany(args) as Promise<any>;
  },
};
