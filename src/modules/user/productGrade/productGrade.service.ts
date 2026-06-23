import { Messages } from '../../../constants/index.js';
import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import {
  ProductRepository,
  ProductGradeRepository,
  ProductGradeLastPurchaseRateRepository,
} from '../../../repositories/index.js';
import { transaction } from '../../../infra/database/prisma/transaction.js';

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

    const product = await ProductRepository.findFirst({
      where: { id: productId, domainId, isDeleted: false },
    });
    if (!product) throw new Error(Messages.PRODUCT.NOT_FOUND);

    const existing = await ProductGradeRepository.findFirst({
      where: { gradeCode, productId, domainId, isDeleted: false },
    });
    if (existing) throw new Error(Messages.PRODUCT_GRADE.CODE_ALREADY_EXISTS);

    return ProductGradeRepository.create({
      ...dto,
      gradeCode,
      searchText,
      productId,
      domainId,
      isDeleted: false,
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
    langCode?: string,
  ) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    const skip = (page - 1) * limit;

    const where = {
      domainId,
      isDeleted: false,
      ...(query.status && { status: query.status }),
      ...(query.productId && { productId: query.productId }),
      ...(query.searchKey && {
        searchText: {
          contains: query.searchKey.trim(),
          mode: Prisma.QueryMode.insensitive,
        },
      }),
    };
    const [data, total] = await Promise.all([
      ProductGradeRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          gradeCode: true,
          gradeDisplayName: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          productId: true,
          product: {
            select: {
              id: true,
              code: true,
              displayName: true,
            },
          },
        },
      }),
      ProductGradeRepository.countWhere({ where }),
    ]);

    const normalizedData = data.map((grade: any) => ({
      id: grade.id,
      gradeCode: grade.gradeCode,
      gradeDisplayName: langCode
        ? ProductGradeService.localizeName(grade.gradeDisplayName, langCode)
        : grade.gradeDisplayName,
      status: grade.status,
      createdAt: grade.createdAt,
      updatedAt: grade.updatedAt,
      productId: grade.productId,
      product: grade.product
        ? {
            id: grade.product.id,
            code: grade.product.code,
            displayName: langCode
              ? ProductGradeService.localizeName(
                  grade.product.displayName,
                  langCode,
                )
              : grade.product.displayName,
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
    langCode?: string,
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
      ProductGradeRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          gradeCode: true,
          gradeDisplayName: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          productId: true,
          product: {
            select: {
              id: true,
              code: true,
              displayName: true,
            },
          },
        },
      }),
      ProductGradeRepository.countWhere({ where }),
    ]);

    const normalizedData = data.map((grade: any) => ({
      id: grade.id,
      gradeCode: grade.gradeCode,
      gradeDisplayName: langCode
        ? ProductGradeService.localizeName(grade.gradeDisplayName, langCode)
        : grade.gradeDisplayName,
      status: grade.status,
      createdAt: grade.createdAt,
      updatedAt: grade.updatedAt,
      productId: grade.productId,
      product: grade.product
        ? {
            id: grade.product.id,
            code: grade.product.code,
            displayName: langCode
              ? ProductGradeService.localizeName(
                  grade.product.displayName,
                  langCode,
                )
              : grade.product.displayName,
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

  async findAllWithLastPurchaseRates(
    domainId: string,
    productId: string,
    query: {
      page?: string;
      limit?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      [key: string]: any;
    },
    langCode?: string,
  ) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    const skip = (page - 1) * limit;

    const product = await ProductRepository.findFirst({
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
      ProductGradeRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          gradeCode: true,
          gradeDisplayName: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          productGradeLastPurchaseRates: {
            where: { isDeleted: false },
            orderBy: { lastPurchaseDate: 'desc' },
            select: {
              id: true,
              lastPrice: true,
              purchaseType: true,
              currencyId: true,
              vendorId: true,
              vendorName: true,
              uomId: true,
              uom: { select: { id: true, code: true, displayName: true } },
              lastPurchaseDate: true,
            },
          },
        },
      }),
      ProductGradeRepository.countWhere({ where }),
    ]);

    const normalizedGrades = data.map((grade: any) => ({
      id: grade.id,
      gradeCode: grade.gradeCode,
      gradeDisplayName: langCode
        ? ProductGradeService.localizeName(grade.gradeDisplayName, langCode)
        : grade.gradeDisplayName,
      status: grade.status,
      createdAt: grade.createdAt,
      updatedAt: grade.updatedAt,
      // One latest rate per UOM for this grade.
      lastPurchaseRates: (grade.productGradeLastPurchaseRates || []).map(
        (rate: any) => ({
          ...rate,
          uomCode: rate.uom?.code ?? null,
          uomName: langCode
            ? ProductGradeService.localizeName(rate.uom?.displayName, langCode)
            : (rate.uom?.displayName ?? null),
        }),
      ),
    }));

    return {
      product: {
        id: product.id,
        code: product.code,
        displayName: langCode
          ? ProductGradeService.localizeName(product.displayName, langCode)
          : product.displayName,
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
    const product = await ProductRepository.findFirst({
      where: { id: productId, domainId, isDeleted: false },
      include: {
        productGrades: {
          where: { id, isDeleted: false },
          include: {
            productGradeLastPurchaseRates: {
              where: { isDeleted: false },
              orderBy: { lastPurchaseDate: 'desc' },
              include: {
                uom: { select: { id: true, code: true, displayName: true } },
              },
            },
          },
        },
      },
    });

    if (!product || product.productGrades.length === 0) {
      throw new Error(Messages.PRODUCT_GRADE.NOT_FOUND);
    }

    const grade = product.productGrades[0];

    if (language) {
      product.displayName = ProductGradeService.localizeName(
        product.displayName,
        language,
      );
      grade.gradeDisplayName = ProductGradeService.localizeName(
        grade.gradeDisplayName,
        language,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { productGrades, ...productData } = product;

    const { productGradeLastPurchaseRates, ...gradeRest } = grade as any;

    // One latest rate per UOM for this grade.
    const lastPurchaseRates = (productGradeLastPurchaseRates || []).map(
      (rate: any) => ({
        ...rate,
        uomCode: rate.uom?.code ?? null,
        uomName: language
          ? ProductGradeService.localizeName(rate.uom?.displayName, language)
          : (rate.uom?.displayName ?? null),
      }),
    );

    return {
      ...productData,
      productGrade: {
        ...gradeRest,
        lastPurchaseRates,
      },
    };
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
      const conflict = await ProductGradeRepository.findFirst({
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
    return ProductGradeRepository.update(id, {
      ...dto,
      ...(gradeCode ? { gradeCode } : {}),
      ...(searchText ? { searchText } : {}),
      updatedAt: new Date(),
    });
  },

  async softDelete(domainId: string, productId: string, id: string) {
    await this.findOne(domainId, productId, id);
    await transaction(async (tx) => {
      await ProductGradeLastPurchaseRateRepository.updateMany(
        { where: { productGradeId: id }, data: { isDeleted: true } },
        tx,
      );
      await ProductGradeRepository.update(id, { isDeleted: true }, tx);
    });
  },
};
