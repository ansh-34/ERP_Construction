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

export const CustomerRateService = {
  async create(domainId: string, adminId: string, dto: CustomerRateDto) {
    return customerRateRepository.create({
      ...rateFields(dto),
      customerId: dto.customerId,
      productId: dto.productId,
      productGradeId: dto.productGradeId,
      effectiveFrom: dto.effectiveFrom,
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
    return { data, pagination: { totalCount, offset, limit } };
  },

  async findOne(domainId: string, adminId: string, id: string) {
    const record = await customerRateRepository.findByIdAndDomain(
      id,
      domainId,
      adminId,
    );
    if (!record) throw new Error(Messages.CUSTOMER_RATE.NOT_FOUND);
    return record;
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
