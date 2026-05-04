import prisma from '../../../infra/database/prisma/prisma.client.js';
import { CreateProductGradeStdRateDto, UpdateProductGradeStdRateDto, ListProductGradeStdRateQuery } from './productGradeStdRate.validation.js';

export const ProductGradeStdRateService = {
  async create(domainId: string, productId: string, gradeId: string, dto: CreateProductGradeStdRateDto) {
    const grade = await prisma.productGrades.findFirst({ where: { id: gradeId, productId, domainId, isDeleted: false } });
    if (!grade) throw new Error('ProductGrade not found');
    return prisma.productGradeStdRates.create({ data: { ...dto, productId, productGradeId: gradeId, domainId, isDeleted: false } as any });
  },

  async findAll(domainId: string, productId: string, gradeId: string, query: ListProductGradeStdRateQuery) {
    const grade = await prisma.productGrades.findFirst({ where: { id: gradeId, productId, domainId, isDeleted: false } });
    if (!grade) throw new Error('ProductGrade not found');

    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    const skip = (page - 1) * limit;

    const where = { domainId, productId, productGradeId: gradeId, isDeleted: false, ...(query.status && { status: query.status }) };
    const [data, total] = await Promise.all([
      prisma.productGradeStdRates.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.productGradeStdRates.count({ where })
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findOne(domainId: string, productId: string, gradeId: string, id: string) {
    const record = await prisma.productGradeStdRates.findFirst({ where: { id, productGradeId: gradeId, productId, domainId, isDeleted: false } });
    if (!record) throw new Error('ProductGradeStdRate not found');
    return record;
  },

  async update(domainId: string, productId: string, gradeId: string, id: string, dto: UpdateProductGradeStdRateDto) {
    await this.findOne(domainId, productId, gradeId, id);
    return prisma.productGradeStdRates.update({ where: { id }, data: { ...dto, updatedAt: new Date() } as any });
  },

  async softDelete(domainId: string, productId: string, gradeId: string, id: string) {
    await this.findOne(domainId, productId, gradeId, id);
    return prisma.productGradeStdRates.update({ where: { id }, data: { isDeleted: true } });
  }
};
