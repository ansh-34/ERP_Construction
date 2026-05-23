import prisma from '../../../infra/database/prisma/prisma.client.js';
import { Messages } from '../../../constants/index.js';
import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';

export const ProductGradeService = {
  localizeName(value: any, langCode: string) {
    if (!value || typeof value !== 'object') return '';
    return value[langCode] || value.en || '';
  },

  normalizeCode(value: string) {
    return value.toString().trim().toUpperCase().replace(/\s+/g, '_');
  },

  async create(
    domainId: string,
    productId: string,
    dto: {
      gradeDisplayName: Record<string, string>;
      gradeCode?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      [key: string]: any;
    },
  ) {
    const incomingLanguageCodes: string[] = Object.keys(
      dto.gradeDisplayName || {},
    );
    if (!incomingLanguageCodes.includes('en')) {
      throw new Error(Messages.PRODUCT_GRADE.GRADE_DISPLAY_NAME_EN_REQUIRED);
    }

    const gradeCode = dto?.gradeDisplayName?.en
      ?.toString()
      .toUpperCase()
      .replace(/\s+/g, '_');
    const searchText = Object.values(dto.gradeDisplayName)
      .join(' ')
      .toLowerCase();

    const product = await prisma.product.findFirst({
      where: { id: productId, domainId, isDeleted: false },
    });
    if (!product) throw new Error(Messages.PRODUCT.NOT_FOUND);

    const existing = await prisma.productGrades.findFirst({
      where: {
        gradeCode,
        productId,
        domainId,
        isDeleted: false,
      },
    });
    if (existing) throw new Error(Messages.PRODUCT_GRADE.CODE_ALREADY_EXISTS);

    return prisma.productGrades.create({
      data: {
        ...dto,
        gradeCode,
        searchText,
        productId,
        domainId,
        isDeleted: false,
      } as any,
    });
  },

  async findAllInDomain(
    domainId: string,
    query: {
      page?: string;
      limit?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      [key: string]: any;
    },
    langCode: string,
  ) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    const skip = (page - 1) * limit;

    const where = {
      domainId,
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
      prisma.productGrades.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          gradeCode: true,
          gradeDisplayName: true,
          product: {
            select: {
              id: true,
              code: true,
              displayName: true,
            },
          },
        },
      }),
      prisma.productGrades.count({ where }),
    ]);

    const normalizedData = data.map((grade: any) => ({
      id: grade.id,
      gradeCode: grade.gradeCode,
      gradeDisplayName: ProductGradeService.localizeName(
        grade.gradeDisplayName,
        langCode,
      ),
      product: grade.product
        ? {
            id: grade.product.id,
            code: grade.product.code,
            displayName: ProductGradeService.localizeName(
              grade.product.displayName,
              langCode,
            ),
          }
        : undefined,
    }));

    return {
      data: normalizedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findAll(
    domainId: string,
    productId: string,
    query: {
      page?: string;
      limit?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
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
      ...(query.searchKey && {
        searchText: {
          contains: query.searchKey.trim(),
          mode: Prisma.QueryMode.insensitive,
        },
      }),
    };
    const [data, total] = await Promise.all([
      prisma.productGrades.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          gradeCode: true,
          gradeDisplayName: true,
          product: {
            select: {
              id: true,
              code: true,
              displayName: true,
            },
          },
          productGradeStdRates: {
            where: { isDeleted: false },
            select: {
              id: true,
              stdRateType: true,
              stdRateValue: true,
            },
          },
        },
      }),
      prisma.productGrades.count({ where }),
    ]);

    const normalizedData = data.map((grade: any) => ({
      id: grade.id,
      gradeCode: grade.gradeCode,
      gradeDisplayName: ProductGradeService.localizeName(
        grade.gradeDisplayName,
        langCode,
      ),
      product: grade.product
        ? {
            id: grade.product.id,
            code: grade.product.code,
            displayName: ProductGradeService.localizeName(
              grade.product.displayName,
              langCode,
            ),
          }
        : undefined,
      productGradeStdRates: (grade.productGradeStdRates || []).map(
        (stdRate: any) => ({
          id: stdRate.id,
          stdRateType: ProductGradeService.localizeName(
            stdRate.stdRateType,
            langCode,
          ),
          stdRateValue: stdRate.stdRateValue,
        }),
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

  async findAllWithStdRates(
    domainId: string,
    productId: string,
    query: {
      page?: string;
      limit?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      [key: string]: any;
    },
    langCode: string,
  ) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    const skip = (page - 1) * limit;

    const product = await prisma.product.findFirst({
      where: { id: productId, domainId, isDeleted: false },
      select: { id: true, code: true, displayName: true },
    });

    if (!product) {
      throw new Error(Messages.PRODUCT.NOT_FOUND);
    }

    const where = {
      domainId,
      productId,
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
      prisma.productGrades.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          gradeCode: true,
          gradeDisplayName: true,
          productGradeStdRates: {
            where: { isDeleted: false },
            select: {
              id: true,
              stdRateType: true,
              stdRateValue: true,
            },
          },
        },
      }),
      prisma.productGrades.count({ where }),
    ]);

    const normalizedGrades = data.map((grade: any) => ({
      id: grade.id,
      gradeCode: grade.gradeCode,
      gradeDisplayName: ProductGradeService.localizeName(
        grade.gradeDisplayName,
        langCode,
      ),
      productGradeStdRates: (grade.productGradeStdRates || []).map(
        (stdRate: any) => ({
          id: stdRate.id,
          stdRateType: ProductGradeService.localizeName(
            stdRate.stdRateType,
            langCode,
          ),
          stdRateValue: stdRate.stdRateValue,
        }),
      ),
    }));

    return {
      product: {
        id: product.id,
        code: product.code,
        displayName: ProductGradeService.localizeName(
          product.displayName,
          langCode,
        ),
      },
      grades: {
        data: normalizedGrades,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findOne(
    domainId: string,
    productId: string,
    id: string,
    language: string | null = null,
  ) {
    const record: any = await prisma.productGrades.findFirst({
      where: { id, productId, domainId, isDeleted: false },
      include: { productGradeStdRates: { where: { isDeleted: false } } },
    });
    if (!record) throw new Error(Messages.PRODUCT_GRADE.NOT_FOUND);

    if (language) {
      record.gradeDisplayName = ProductGradeService.localizeName(
        record.gradeDisplayName,
        language,
      );
      record.productGradeStdRates = (record.productGradeStdRates || []).map(
        (stdRate: any) => ({
          ...stdRate,
          stdRateType: ProductGradeService.localizeName(
            stdRate.stdRateType,
            language,
          ),
        }),
      );
    }

    return record;
  },

  async update(
    domainId: string,
    productId: string,
    id: string,
    dto: {
      gradeDisplayName?: Record<string, string>;
      gradeCode?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      [key: string]: any;
    },
  ) {
    await this.findOne(domainId, productId, id);
    if (dto.gradeDisplayName) {
      const incomingLanguageCodes: string[] = Object.keys(dto.gradeDisplayName);
      if (!incomingLanguageCodes.includes('en')) {
        throw new Error(Messages.PRODUCT_GRADE.GRADE_DISPLAY_NAME_EN_REQUIRED);
      }
    }
    let gradeCode: string | null = null;
    if (dto.gradeCode) {
      gradeCode = ProductGradeService.normalizeCode(dto.gradeCode);
      const conflict = await prisma.productGrades.findFirst({
        where: {
          gradeCode,
          productId,
          domainId,
          isDeleted: false,
          NOT: { id },
        },
      });
      if (conflict) throw new Error(Messages.PRODUCT_GRADE.CODE_ALREADY_EXISTS);
    }

    const searchText = dto?.gradeDisplayName
      ? Object.values(dto.gradeDisplayName).join(' ').toLowerCase()
      : null;
    return prisma.productGrades.update({
      where: { id },
      data: {
        ...dto,
        ...(gradeCode ? { gradeCode } : {}),
        ...(searchText ? { searchText } : {}),
        updatedAt: new Date(),
      } as any,
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
