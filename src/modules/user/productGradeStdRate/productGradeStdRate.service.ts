import prisma from '../../../infra/database/prisma/prisma.client.js';
import { Messages } from '../../../constants/index.js';
import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';

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
        ...dto,
        searchText,
        productId,
        productGradeId: gradeId,
        domainId,
        isDeleted: false,
      } as any,
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
      }),
      prisma.productGradeStdRates.count({ where }),
    ]);

    const normalizedData = data.map((stdRate: any) => ({
      ...stdRate,
      stdRateType: ProductGradeStdRateService.localizeName(
        stdRate.stdRateType,
        langCode,
      ),
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
    const product = await prisma.product.findFirst({
      where: { id: productId, domainId, isDeleted: false },
      include: {
        productGrades: {
          where: { id: gradeId, isDeleted: false },
          include: {
            productGradeStdRates: {
              where: { id, isDeleted: false },
            },
          },
        },
      },
    });

    if (
      !product ||
      product.productGrades.length === 0 ||
      product.productGrades[0].productGradeStdRates.length === 0
    ) {
      throw new Error(Messages.PRODUCT_GRADE_STD_RATE.NOT_FOUND);
    }

    const grade = product.productGrades[0];
    const stdRate = grade.productGradeStdRates[0];

    if (language) {
      product.displayName = ProductGradeStdRateService.localizeName(
        product.displayName,
        language,
      );
      grade.gradeDisplayName = ProductGradeStdRateService.localizeName(
        grade.gradeDisplayName,
        language,
      );
      stdRate.stdRateType = ProductGradeStdRateService.localizeName(
        stdRate.stdRateType,
        language,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { productGradeStdRates, ...gradeData } = grade;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { productGrades, ...productData } = product;

    return {
      ...productData,
      productGrade: {
        ...gradeData,
        productGradeStdRate: stdRate,
      },
    };
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

    return prisma.productGradeStdRates.update({
      where: { id },
      data: {
        ...dto,
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
