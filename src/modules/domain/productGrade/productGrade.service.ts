import prisma from '../../../infra/database/prisma/prisma.client.js';
import {
  CreateProductGradeDto,
  UpdateProductGradeDto,
  ListProductGradeQuery,
} from './productGrade.validation.js';

export const ProductGradeService = {
  async create(
    domainId: string,
    productId: string,
    dto: CreateProductGradeDto,
  ) {
    const product = await prisma.product.findFirst({
      where: { id: productId, domainId, isDeleted: false },
    });
    if (!product) throw new Error('Product not found');

    const existing = await prisma.productGrades.findFirst({
      where: {
        gradeCode: dto.gradeCode,
        productId,
        domainId,
        isDeleted: false,
      },
    });
    if (existing)
      throw new Error(
        `Grade code '${dto.gradeCode}' already exists for this product`,
      );

    return prisma.productGrades.create({
      data: { ...dto, productId, domainId, isDeleted: false } as any,
    });
  },

  async findAll(
    domainId: string,
    productId: string,
    query: ListProductGradeQuery,
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
      prisma.productGrades.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { productGradeStdRates: { where: { isDeleted: false } } },
      }),
      prisma.productGrades.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findOne(domainId: string, productId: string, id: string) {
    const record = await prisma.productGrades.findFirst({
      where: { id, productId, domainId, isDeleted: false },
      include: { productGradeStdRates: { where: { isDeleted: false } } },
    });
    if (!record) throw new Error('ProductGrade not found');
    return record;
  },

  async update(
    domainId: string,
    productId: string,
    id: string,
    dto: UpdateProductGradeDto,
  ) {
    await this.findOne(domainId, productId, id);
    if (dto.gradeCode) {
      const conflict = await prisma.productGrades.findFirst({
        where: {
          gradeCode: dto.gradeCode,
          productId,
          domainId,
          isDeleted: false,
          NOT: { id },
        },
      });
      if (conflict)
        throw new Error(
          `Grade code '${dto.gradeCode}' already exists for this product`,
        );
    }
    return prisma.productGrades.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() } as any,
    });
  },

  async softDelete(domainId: string, productId: string, id: string) {
    await this.findOne(domainId, productId, id);
    await prisma.$transaction([
      prisma.productGradeStdRates.updateMany({
        where: { productGradeId: id },
        data: { isDeleted: true },
      }),
      prisma.productGrades.update({ where: { id }, data: { isDeleted: true } }),
    ]);
  },
};
