import prisma from '../../../infra/database/prisma/prisma.client.js';
import { Messages } from '../../../constants/index.js';
import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import { normalizeStatus } from '../../../utils/validation.js';

export const ProductGradeStdRateService = {
  localizeName(value: any, langCode: string) {
    if (!value || typeof value !== 'object') return '';
    return value[langCode] || value.en || '';
  },

  async create(
    domainId: string,
    productId: string,
    gradeId: string,
    dto: {
      stdRateType: Record<string, string>;
      status?: 'ACTIVE' | 'INACTIVE';
      [key: string]: any;
    },
  ) {
    const incomingLanguageCodes: string[] = Object.keys(dto.stdRateType || {});
    if (!incomingLanguageCodes.includes('en')) {
      throw new Error(
        Messages.PRODUCT_GRADE_STD_RATE.STD_RATE_TYPE_EN_REQUIRED,
      );
    }

    const searchText = Object.values(dto.stdRateType).join(' ').toLowerCase();

    const grade = await prisma.productGrades.findFirst({
      where: { id: gradeId, productId, domainId, isDeleted: false },
    });
    if (!grade) throw new Error(Messages.PRODUCT_GRADE.NOT_FOUND);

    return prisma.productGradeStdRates.create({
      data: {
        stdRateType: dto.stdRateType,
        stdRateValue: dto.stdRateValue,
        alertThresold: dto.alertThresold,
        status: normalizeStatus(dto.status),
        searchText,
        productId,
        productGradeId: gradeId,
        domainId,
        isDeleted: false,
      },
      include: {
        productGrade: {
          select: { id: true, gradeDisplayName: true, gradeCode: true },
        },
      },
    });
  },

  async findAll(
    domainId: string,
    productId: string,
    gradeId: string,
    query: {
      page?: string;
      limit?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      [key: string]: any;
    },
    langCode: string,
  ) {
    const grade = await prisma.productGrades.findFirst({
      where: { id: gradeId, productId, domainId, isDeleted: false },
    });
    if (!grade) throw new Error(Messages.PRODUCT_GRADE.NOT_FOUND);

    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    const skip = (page - 1) * limit;

    const where = {
      domainId,
      productId,
      productGradeId: gradeId,
      isDeleted: false,
      ...(query.status && { status: query.status }),
      ...(query.searchKey && {
        searchText: {
          contains: query.searchKey.trim(),
          mode: Prisma.QueryMode.insensitive,
        },
      }),
    };
    const [data, total] = await Promise.all([
      prisma.productGradeStdRates.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          productGrade: {
            select: { id: true, gradeDisplayName: true, gradeCode: true },
          },
        },
      }),
      prisma.productGradeStdRates.count({ where }),
    ]);

    const normalizedData = data.map((stdRate: any) => ({
      ...stdRate,
      stdRateType: ProductGradeStdRateService.localizeName(
        stdRate.stdRateType,
        langCode,
      ),
      productGrade: stdRate.productGrade
        ? {
            ...stdRate.productGrade,
            gradeDisplayName: ProductGradeStdRateService.localizeName(
              stdRate.productGrade.gradeDisplayName,
              langCode,
            ),
          }
        : stdRate.productGrade,
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
    gradeId: string,
    id: string,
    language: string | null = null,
  ) {
    const record: any = await prisma.productGradeStdRates.findFirst({
      where: {
        id,
        productGradeId: gradeId,
        productId,
        domainId,
        isDeleted: false,
      },
      include: {
        productGrade: {
          select: { id: true, gradeDisplayName: true, gradeCode: true },
        },
      },
    });
    if (!record) throw new Error(Messages.PRODUCT_GRADE_STD_RATE.NOT_FOUND);

    if (language) {
      record.stdRateType = ProductGradeStdRateService.localizeName(
        record.stdRateType,
        language,
      );
      if (record.productGrade) {
        record.productGrade.gradeDisplayName =
          ProductGradeStdRateService.localizeName(
            record.productGrade.gradeDisplayName,
            language,
          );
      }
    }

    return record;
  },

  async update(
    domainId: string,
    productId: string,
    gradeId: string,
    id: string,
    dto: {
      stdRateType?: Record<string, string>;
      status?: 'ACTIVE' | 'INACTIVE';
      [key: string]: any;
    },
  ) {
    await this.findOne(domainId, productId, gradeId, id);

    if (dto.stdRateType) {
      const incomingLanguageCodes: string[] = Object.keys(dto.stdRateType);
      if (!incomingLanguageCodes.includes('en')) {
        throw new Error(
          Messages.PRODUCT_GRADE_STD_RATE.STD_RATE_TYPE_EN_REQUIRED,
        );
      }
    }

    let searchText: string | null = null;
    if (dto.stdRateType) {
      searchText = Object.values(dto.stdRateType).join(' ').toLowerCase();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { domainId: _d, adminId: _a, ...rateData } = dto;
    return prisma.productGradeStdRates.update({
      where: { id },
      data: {
        ...rateData,
        ...(dto.status ? { status: normalizeStatus(dto.status) } : {}),
        ...(searchText ? { searchText } : {}),
        updatedAt: new Date(),
      } as any,
      include: {
        productGrade: {
          select: { id: true, gradeDisplayName: true, gradeCode: true },
        },
      },
    });
  },

  async softDelete(
    domainId: string,
    productId: string,
    gradeId: string,
    id: string,
  ) {
    await this.findOne(domainId, productId, gradeId, id);
    return prisma.productGradeStdRates.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
