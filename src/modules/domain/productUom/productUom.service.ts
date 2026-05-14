import { Messages } from '../../../constants/index.js';
import prisma from '../../../infra/database/prisma/prisma.client.js';
import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';

export const ProductUomService = {
  localizeName(value: any, langCode: string) {
    if (!value || typeof value !== 'object') return '';
    return value[langCode] || value.en || '';
  },

  async create(
    domainId: string,
    productId: string,
    dto: { uomId: string; status?: string; [key: string]: any },
  ) {
    return prisma.$transaction(async (tx: any) => {
      const product = await tx.product.findFirst({
        where: { id: productId, domainId, isDeleted: false },
      });
      if (!product) throw new Error(Messages.PRODUCT.NOT_FOUND);

      const uom = await tx.uom.findFirst({
        where: { id: dto.uomId, domainId, isDeleted: false },
      });
      if (!uom) throw new Error(Messages.UOM.NOT_FOUND);

      const existing = await tx.productUom.findUnique({
        where: { productId_uomId: { productId, uomId: dto.uomId } },
      });
      if (existing && !existing.isDeleted)
        throw new Error(Messages.PRODUCT_UOM.ALEADY_ASSIGNED);

      if (existing?.isDeleted) {
        return tx.productUom.update({
          where: { id: existing.id },
          data: { isDeleted: false, status: dto.status },
          include: { uom: true },
        });
      }

      try {
        return await tx.productUom.create({
          data: { productId, uomId: dto.uomId, domainId, status: dto.status },
          include: { uom: true },
        });
      } catch (error: any) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          const conflicted = await tx.productUom.findUnique({
            where: { productId_uomId: { productId, uomId: dto.uomId } },
          });

          if (conflicted && !conflicted.isDeleted) {
            throw new Error(Messages.PRODUCT_UOM.ALEADY_ASSIGNED);
          }

          if (conflicted?.isDeleted) {
            return tx.productUom.update({
              where: { id: conflicted.id },
              data: { isDeleted: false, status: dto.status },
              include: { uom: true },
            });
          }
        }

        throw error;
      }
    });
  },

  async findAll(
    domainId: string,
    productId: string,
    query: {
      page?: string;
      limit?: string;
      status?: string;
      [key: string]: any;
    },
    langCode: string,
  ) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    const skip = (page - 1) * limit;

    const where = {
      domainId,
      productId,
      isDeleted: false,
      ...(query.status && { status: query.status }),
    };
    const [data, total] = await Promise.all([
      prisma.productUom.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { uom: true },
      }),
      prisma.productUom.count({ where }),
    ]);

    const normalizedData = data.map((productUom: any) => ({
      ...productUom,
      uom: {
        ...productUom.uom,
        displayName: ProductUomService.localizeName(
          productUom.uom.displayName,
          langCode,
        ),
      },
    }));

    return {
      data: normalizedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findOne(
    domainId: string,
    productId: string,
    id: string,
    language: string | null = null,
  ) {
    const record: any = await prisma.productUom.findFirst({
      where: { id, productId, domainId, isDeleted: false },
      include: { uom: true },
    });
    if (!record) throw new Error(Messages.PRODUCT_UOM.NOT_FOUND);

    if (language) {
      record.uom.displayName = ProductUomService.localizeName(
        record.uom.displayName,
        language,
      );
    }

    return record;
  },

  async softDelete(domainId: string, productId: string, id: string) {
    await this.findOne(domainId, productId, id);
    return prisma.productUom.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
