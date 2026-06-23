import { Messages } from '../../../constants/index.js';
import { customerRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';

type CustomerDto = {
  name: string;
  phoneCode?: string;
  phone?: string;
  paymentTerms?: 'CASH' | 'CREDIT';
  gstNumber?: string;
  billingName?: string;
  billingAddress?: string;
  shippingAddress?: string;
  locationId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
};

const buildSearchText = (dto: {
  name?: string | null;
  phoneCode?: string | null;
  phone?: string | null;
  gstNumber?: string | null;
  billingName?: string | null;
}) =>
  [dto.name, dto.phoneCode, dto.phone, dto.gstNumber, dto.billingName]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const customerFields = (dto: Partial<CustomerDto>) => ({
  ...(dto.name !== undefined && { name: dto.name }),
  ...(dto.phoneCode !== undefined && { phoneCode: dto.phoneCode }),
  ...(dto.phone !== undefined && { phone: dto.phone }),
  ...(dto.paymentTerms !== undefined && { paymentTerms: dto.paymentTerms }),
  ...(dto.gstNumber !== undefined && { gstNumber: dto.gstNumber }),
  ...(dto.billingName !== undefined && { billingName: dto.billingName }),
  ...(dto.billingAddress !== undefined && {
    billingAddress: dto.billingAddress,
  }),
  ...(dto.shippingAddress !== undefined && {
    shippingAddress: dto.shippingAddress,
  }),
  ...(dto.locationId !== undefined && { locationId: dto.locationId }),
});

export const CustomerService = {
  async create(domainId: string, adminId: string, dto: CustomerDto) {
    return customerRepository.create({
      ...customerFields(dto),
      name: dto.name,
      status: dto.status ?? 'ACTIVE',
      searchText: buildSearchText(dto),
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
      searchKey?: string;
    },
  ) {
    const { offset, limit } = normalizePagination(query);
    const [totalCount, data] = await customerRepository.listByDomain(
      domainId,
      adminId,
      limit,
      offset,
      { status: query.status, searchKey: query.searchKey },
    );
    return { data, pagination: { totalCount, offset, limit } };
  },

  async findOne(domainId: string, adminId: string, id: string) {
    const customer = await customerRepository.findByIdAndDomain(
      id,
      domainId,
      adminId,
    );
    if (!customer) throw new Error(Messages.CUSTOMER.NOT_FOUND);
    return customer;
  },

  async update(
    domainId: string,
    adminId: string,
    id: string,
    dto: Partial<CustomerDto>,
  ) {
    const existing = await CustomerService.findOne(domainId, adminId, id);
    const fields = customerFields(dto);
    const merged = { ...existing, ...fields };
    return customerRepository.update(id, {
      ...fields,
      ...(dto.status !== undefined && { status: dto.status }),
      searchText: buildSearchText(merged),
    });
  },

  async softDelete(domainId: string, adminId: string, id: string) {
    await CustomerService.findOne(domainId, adminId, id);
    return customerRepository.softDelete(id);
  },
};
