import { Prisma } from '@infra/database/prisma/generated/prisma/client/client.js';
import prisma from '../infra/database/prisma/prisma.client.js';

export const ReportRepository = {
  findProducts<T extends Prisma.ProductFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.ProductFindManyArgs>,
  ) {
    return prisma.product.findMany(args);
  },

  findVendors<T extends Prisma.VendorFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.VendorFindManyArgs>,
  ) {
    return prisma.vendor.findMany(args);
  },

  findPaymentRequests<T extends Prisma.PaymentRequestFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.PaymentRequestFindManyArgs>,
  ) {
    return prisma.paymentRequest.findMany(args);
  },
};
