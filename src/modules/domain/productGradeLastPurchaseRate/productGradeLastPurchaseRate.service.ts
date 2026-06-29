import { ProductGradeLastPurchaseRateRepository } from '../../../repositories/index.js';
import { Messages } from '../../../constants/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';

function localizeName(value: any, langCode: string) {
  if (!value || typeof value !== 'object') return value ?? '';
  return value[langCode] || value.en || '';
}

function normalize(rate: any, lang: string | null) {
  const flat = lang !== null;
  const name = (v: any) => (flat ? localizeName(v, lang!) : v);

  return {
    id: rate.id,
    productId: rate.productId,
    productGradeId: rate.productGradeId,
    uomId: rate.uomId,
    uomCode: rate.uom?.code ?? null,
    uomName: name(rate.uom?.displayName),
    lastPrice: rate.lastPrice,
    purchaseType: rate.purchaseType,
    currencyId: rate.currencyId,
    vendorId: rate.vendorId,
    vendorName: rate.vendorName,
    lastInvoiceId: rate.lastInvoiceId,
    lastPurchaseDate: rate.lastPurchaseDate,
    status: rate.status,
    createdAt: rate.createdAt,
    updatedAt: rate.updatedAt,
    product: rate.product
      ? {
          id: rate.product.id,
          code: rate.product.code,
          displayName: name(rate.product.displayName),
        }
      : null,
    productGrade: rate.productGrade
      ? {
          id: rate.productGrade.id,
          gradeCode: rate.productGrade.gradeCode,
          gradeDisplayName: name(rate.productGrade.gradeDisplayName),
        }
      : null,
    currency: rate.currency
      ? {
          id: rate.currency.id,
          code: rate.currency.code,
          symbol: rate.currency.symbol,
          name: name(rate.currency.name),
        }
      : null,
  };
}

const includeRelations = {
  product: { select: { id: true, code: true, displayName: true } },
  productGrade: {
    select: { id: true, gradeCode: true, gradeDisplayName: true },
  },
  uom: { select: { id: true, code: true, displayName: true } },
  currency: { select: { id: true, code: true, symbol: true, name: true } },
};

export const ProductGradeLastPurchaseRateService = {
  async findAll(
    domainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      productId?: string;
      productGradeId?: string;
      gradeId?: string;
      uomId?: string;
      lang?: string;
      [key: string]: any;
    },
  ) {
    const { offset, limit } = normalizePagination(query);

    // List defaults to 'en'; a specific lang query flattens to that language.
    const lang: string = query.lang || 'en';

    const where = {
      domainId,
      isDeleted: false,
      ...(query.status && { status: query.status }),
      ...(query.productId && { productId: query.productId }),
      ...((query.gradeId || query.productGradeId) && {
        productGradeId: query.gradeId || query.productGradeId,
      }),
      ...(query.uomId && { uomId: query.uomId }),
      ...(query.searchKey && {
        searchText: {
          contains: query.searchKey.trim(),
          mode: Prisma.QueryMode.insensitive,
        },
      }),
    };

    const [data, totalCount] = await Promise.all([
      ProductGradeLastPurchaseRateRepository.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { lastPurchaseDate: 'desc' },
        include: includeRelations,
      }),
      ProductGradeLastPurchaseRateRepository.count({ where }),
    ]);

    return {
      data: data.map((rate: any) => normalize(rate, lang)),
      totalCount,
      offset,
      limit,
    };
  },

  async findOne(domainId: string, id: string, lang: string | null) {
    const rate = await ProductGradeLastPurchaseRateRepository.findFirst({
      where: { id, domainId, isDeleted: false },
      include: includeRelations,
    });
    if (!rate) {
      throw new Error(Messages.PRODUCT_GRADE_LAST_PURCHASE_RATE.NOT_FOUND);
    }
    return normalize(rate, lang);
  },
};
