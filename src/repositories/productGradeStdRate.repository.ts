import prisma from '../infra/database/prisma/prisma.client.js';

export const ProductGradeStdRateRepository = {
  create(data: any, tx?: any, include?: any) {
    const client = tx || prisma;
    return client.productGradeStdRates.create({
      data,
      ...(include ? { include } : {}),
    });
  },

  findFirst(args: any, tx?: any): Promise<any> {
    const client = tx || prisma;
    return client.productGradeStdRates.findFirst(args) as Promise<any>;
  },

  findMany(args: any, tx?: any): Promise<any> {
    const client = tx || prisma;
    return client.productGradeStdRates.findMany(args) as Promise<any>;
  },

  count(args: any, tx?: any): Promise<any> {
    const client = tx || prisma;
    return client.productGradeStdRates.count(args) as Promise<any>;
  },

  update(id: string, data: any, tx?: any, include?: any) {
    const client = tx || prisma;
    return client.productGradeStdRates.update({
      where: { id },
      data,
      ...(include ? { include } : {}),
    });
  },

  updateMany(args: any, tx?: any): Promise<any> {
    const client = tx || prisma;
    return client.productGradeStdRates.updateMany(args) as Promise<any>;
  },
};
