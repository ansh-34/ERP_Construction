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

  findUoms<T extends Prisma.UomFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.UomFindManyArgs>,
  ) {
    return prisma.uom.findMany(args);
  },

  findInvoices<T extends Prisma.InvoiceFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.InvoiceFindManyArgs>,
  ) {
    return prisma.invoice.findMany(args);
  },

  findGrns<T extends Prisma.GrnFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.GrnFindManyArgs>,
  ) {
    return prisma.grn.findMany(args);
  },

  findRawMaterialPurchaseRequests<
    T extends Prisma.RawMaterialPurchaseRequestFindManyArgs,
  >(
    args?: Prisma.SelectSubset<
      T,
      Prisma.RawMaterialPurchaseRequestFindManyArgs
    >,
  ) {
    return prisma.rawMaterialPurchaseRequest.findMany(args);
  },

  findInvoiceItems<T extends Prisma.InvoiceItemFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.InvoiceItemFindManyArgs>,
  ) {
    return prisma.invoiceItem.findMany(args);
  },

  findGrnProducts<T extends Prisma.GrnProductFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.GrnProductFindManyArgs>,
  ) {
    return prisma.grnProduct.findMany(args);
  },
};
