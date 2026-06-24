import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

type ProductInput = {
  productId: string;
  productGradeId?: string | null;
  quantity: number;
  uomId: string;
  unitRate: number;
  taxAmount: number;
  transportationCharge: number;
  royaltyAmount: number;
};

const productInclude = {
  product: true,
  productGrade: true,
  uom: true,
} as const;
const orderInclude = {
  saleOrderProducts: { include: productInclude },
  customer: true,
} as const;

export const saleOrderRepository = {
  createWithProducts(
    orderData: Prisma.SaleOrderUncheckedCreateInput,
    products: (ProductInput & { domainId: string; adminId: string })[],
  ) {
    return prisma.$transaction(async (tx) => {
      const saleOrder = await tx.saleOrder.create({ data: orderData });

      const saleOrderProducts = await Promise.all(
        products.map((p) =>
          tx.saleOrderProduct.create({
            data: {
              saleOrderId: saleOrder.id,
              productId: p.productId,
              productGradeId: p.productGradeId ?? null,
              quantity: p.quantity,
              uomId: p.uomId,
              unitRate: p.unitRate,
              amount: p.unitRate * p.quantity,
              taxAmount: p.taxAmount,
              transportationCharge: p.transportationCharge,
              royaltyAmount: p.royaltyAmount,
              domainId: p.domainId,
              adminId: p.adminId,
              status: 'ACTIVE',
              isDeleted: false,
            },
            include: productInclude,
          }),
        ),
      );

      return { ...saleOrder, saleOrderProducts };
    });
  },

  updateWithProducts(
    id: string,
    orderData: Prisma.SaleOrderUncheckedUpdateInput,
    products:
      | (ProductInput & { domainId: string; adminId: string })[]
      | undefined,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.saleOrder.update({
        where: { id },
        data: orderData,
      });

      if (products !== undefined) {
        for (const p of products) {
          const existing = await tx.saleOrderProduct.findFirst({
            where: {
              saleOrderId: id,
              productId: p.productId,
              productGradeId: p.productGradeId ?? null,
              uomId: p.uomId,
              isDeleted: false,
            },
          });

          if (existing) {
            await tx.saleOrderProduct.update({
              where: { id: existing.id },
              data: {
                quantity: p.quantity,
                unitRate: p.unitRate,
                amount: p.unitRate * p.quantity,
                taxAmount: p.taxAmount,
                transportationCharge: p.transportationCharge,
                royaltyAmount: p.royaltyAmount,
              },
            });
          } else {
            await tx.saleOrderProduct.create({
              data: {
                saleOrderId: id,
                productId: p.productId,
                productGradeId: p.productGradeId ?? null,
                quantity: p.quantity,
                uomId: p.uomId,
                unitRate: p.unitRate,
                amount: p.unitRate * p.quantity,
                taxAmount: p.taxAmount,
                transportationCharge: p.transportationCharge,
                royaltyAmount: p.royaltyAmount,
                domainId: p.domainId,
                adminId: p.adminId,
                status: 'ACTIVE',
                isDeleted: false,
              },
            });
          }
        }
      }

      const saleOrderProducts = await tx.saleOrderProduct.findMany({
        where: { saleOrderId: id, isDeleted: false },
        include: productInclude,
      });

      const recalculated = await tx.saleOrder.update({
        where: { id },
        data: {
          totalAmount: saleOrderProducts.reduce(
            (s, p) => s + Number(p.amount),
            0,
          ),
          totalTaxAmount: saleOrderProducts.reduce(
            (s, p) => s + Number(p.taxAmount),
            0,
          ),
          totalTransportationCharges: saleOrderProducts.reduce(
            (s, p) => s + Number(p.transportationCharge),
            0,
          ),
          totalRoyaltyCharges: saleOrderProducts.reduce(
            (s, p) => s + Number(p.royaltyAmount),
            0,
          ),
        },
      });

      return { ...recalculated, saleOrderProducts };
    });
  },

  listByDomain(
    domainId: string,
    adminId: string,
    limit: number,
    offset: number,
    filter?: {
      status?: 'ACTIVE' | 'INACTIVE';
      orderStatus?: string;
      paymentType?: string;
      customerId?: string;
      searchKey?: string;
    },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.SaleOrderWhereInput = {
      domainId,
      adminId,
      isDeleted: false,
      ...(filter?.status && { status: filter.status }),
      ...(filter?.orderStatus && { orderStatus: filter.orderStatus as any }),
      ...(filter?.paymentType && { paymentType: filter.paymentType as any }),
      ...(filter?.customerId && { customerId: filter.customerId }),
      ...(searchKey && {
        OR: [
          {
            ticketNumber: { contains: searchKey, mode: 'insensitive' as const },
          },
          {
            customerName: { contains: searchKey, mode: 'insensitive' as const },
          },
          {
            customerPhone: {
              contains: searchKey,
              mode: 'insensitive' as const,
            },
          },
          { remarks: { contains: searchKey, mode: 'insensitive' as const } },
        ],
      }),
    };

    return prisma.$transaction([
      prisma.saleOrder.count({ where }),
      prisma.saleOrder.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: orderInclude,
      }),
    ]);
  },

  findByIdAndDomain(id: string, domainId: string, adminId: string) {
    return prisma.saleOrder.findFirst({
      where: { id, domainId, adminId, isDeleted: false },
      include: orderInclude,
    });
  },

  findProductLine(productLineId: string, saleOrderId: string) {
    return prisma.saleOrderProduct.findFirst({
      where: { id: productLineId, saleOrderId, isDeleted: false },
    });
  },

  deleteProductLine(productLineId: string) {
    return prisma.saleOrderProduct.delete({ where: { id: productLineId } });
  },

  getTicketNumbers(domainId: string) {
    return prisma.saleOrder.findMany({
      where: { domainId, ticketNumber: { startsWith: 'TK-' } },
      select: { ticketNumber: true },
    });
  },

  softDelete(id: string) {
    return prisma.saleOrder.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },
};
