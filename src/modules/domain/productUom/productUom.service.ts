import prisma from '../../../infra/database/prisma/prisma.client.js';
import {
  CreateProductUomDto,
  ListProductUomQuery,
} from './productUom.validation.js';

export const ProductUomService = {
  async create(domainId: string, productId: string, dto: CreateProductUomDto) {
    const product = await prisma.product.findFirst({
      where: { id: productId, domainId, isDeleted: false },
    });
    if (!product) throw new Error('Product not found');

    const uom = await prisma.uom.findFirst({
      where: { id: dto.uomId, domainId, isDeleted: false },
    });
    if (!uom) throw new Error('UOM not found');

    const existing = await prisma.productUom.findUnique({
      where: { productId_uomId: { productId, uomId: dto.uomId } },
    });
    if (existing && !existing.isDeleted)
      throw new Error('This UOM is already assigned to the product');

    if (existing?.isDeleted) {
      return prisma.productUom.update({
        where: { id: existing.id },
        data: { isDeleted: false, status: dto.status },
        include: { uom: true },
      });
    }

    return prisma.productUom.create({
      data: { productId, uomId: dto.uomId, domainId, status: dto.status },
      include: { uom: true },
    });
  },

  async findAll(
    domainId: string,
    productId: string,
    query: ListProductUomQuery,
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

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findOne(domainId: string, productId: string, id: string) {
    const record = await prisma.productUom.findFirst({
      where: { id, productId, domainId, isDeleted: false },
      include: { uom: true },
    });
    if (!record) throw new Error('ProductUom not found');
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
