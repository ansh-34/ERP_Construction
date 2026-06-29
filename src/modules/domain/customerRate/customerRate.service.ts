import { Messages } from '../../../constants/index.js';
import { customerRateRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';

type CustomerRateDto = {
  customerId: string;
  productId: string;
  productGradeId: string;
  rate: number;
  currencyId: string;
  uomId: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  status?: 'ACTIVE' | 'INACTIVE';
};

const rateFields = (dto: Partial<CustomerRateDto>) => ({
  ...(dto.rate !== undefined && { rate: dto.rate }),
  ...(dto.currencyId !== undefined && { currencyId: dto.currencyId }),
  ...(dto.uomId !== undefined && { uomId: dto.uomId }),
  ...(dto.effectiveFrom !== undefined && { effectiveFrom: dto.effectiveFrom }),
  ...(dto.effectiveTo !== undefined && { effectiveTo: dto.effectiveTo }),
});

function localizeName(value: unknown, lang: string): string {
  if (typeof value === 'object' && value !== null) {
    const map = value as Record<string, string>;
    return map[lang] ?? map.en ?? '';
  }
  return '';
}

function normalize(record: any, lang: string | null) {
  const name = (v: unknown) => (lang !== null ? localizeName(v, lang) : v);
  return {
    ...record,
    product: record.product
      ? {
          id: record.product.id,
          code: record.product.code,
          name: name(record.product.displayName),
        }
      : null,
    productGrade: record.productGrade
      ? {
          id: record.productGrade.id,
          gradeCode: record.productGrade.gradeCode,
          name: name(record.productGrade.gradeDisplayName),
        }
      : null,
    uom: record.uom
      ? {
          id: record.uom.id,
          code: record.uom.code,
          name: name(record.uom.displayName),
        }
      : null,
    currency: record.currency
      ? {
          id: record.currency.id,
          code: record.currency.code,
          symbol: record.currency.symbol,
          name: name(record.currency.name),
        }
      : null,
  };
}

export const CustomerRateService = {
  async create(domainId: string, adminId: string, dto: CustomerRateDto) {
    return customerRateRepository.create({
      customerId: dto.customerId,
      productId: dto.productId,
      productGradeId: dto.productGradeId,
      rate: dto.rate,
      currencyId: dto.currencyId,
      uomId: dto.uomId,
      effectiveFrom: dto.effectiveFrom,
      ...(dto.effectiveTo !== undefined && { effectiveTo: dto.effectiveTo }),
      status: dto.status ?? 'ACTIVE',
      domainId,
      adminId,
      isDeleted: false,
    });
  },

  async findAll(
    domainId: string,
    adminId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: 'ACTIVE' | 'INACTIVE';
      customerId?: string;
      productId?: string;
      productGradeId?: string;
    },
    lang?: string | null,
  ) {
    const { offset, limit } = normalizePagination(query);
    const [totalCount, data] = await customerRateRepository.listByDomain(
      domainId,
      adminId,
      limit,
      offset,
      {
        status: query.status,
        customerId: query.customerId,
        productId: query.productId,
        productGradeId: query.productGradeId,
      },
    );
    const normalized = data.map((r: any) => normalize(r, lang ?? null));
    return { data: normalized, pagination: { totalCount, offset, limit } };
  },

  async findOne(
    domainId: string,
    adminId: string,
    id: string,
    lang: string | null = null,
  ) {
    const record = await customerRateRepository.findByIdAndDomain(
      id,
      domainId,
      adminId,
    );
    if (!record) throw new Error(Messages.CUSTOMER_RATE.NOT_FOUND);
    return normalize(record, lang);
  },

  async update(
    domainId: string,
    adminId: string,
    id: string,
    dto: Partial<CustomerRateDto>,
  ) {
    await CustomerRateService.findOne(domainId, adminId, id);
    return customerRateRepository.update(id, {
      ...rateFields(dto),
      ...(dto.status !== undefined && { status: dto.status }),
    });
  },

  async softDelete(domainId: string, adminId: string, id: string) {
    await CustomerRateService.findOne(domainId, adminId, id);
    return customerRateRepository.softDelete(id);
  },
};
