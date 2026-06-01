import { Messages } from '../../../constants/index.js';
import { vendorRepository } from '../../../repositories/index.js';
import { normalizeStatus } from '../../../utils/validation.js';

type VendorDto = {
  code: string;
  name: string;
  email: string;
  contactPerson?: string;
  phoneCode?: string;
  phone?: string;
  industry?: string;
  address?: string;
  status?: 'active' | 'inactive' | 'ACTIVE' | 'INACTIVE';
};

const normalizeCode = (value: string) =>
  value.trim().toUpperCase().replace(/\s+/g, '_');

const buildSearchText = (dto: Record<string, unknown>) =>
  [
    dto.code,
    dto.name,
    dto.email,
    dto.contactPerson,
    dto.phoneCode,
    dto.phone,
    dto.industry,
    dto.address,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const vendorFields = (dto: Partial<VendorDto>) => ({
  ...(dto.name !== undefined && { name: dto.name }),
  ...(dto.contactPerson !== undefined && { contactPerson: dto.contactPerson }),
  ...(dto.phoneCode !== undefined && { phoneCode: dto.phoneCode }),
  ...(dto.phone !== undefined && { phone: dto.phone }),
  ...(dto.industry !== undefined && { industry: dto.industry }),
  ...(dto.address !== undefined && { address: dto.address }),
});

export const VendorService = {
  async create(domainId: string, dto: VendorDto) {
    const code = normalizeCode(dto.code);
    const email = dto.email.trim().toLowerCase();

    if (await vendorRepository.findActiveByCode(domainId, code)) {
      throw new Error(Messages.VENDOR.CODE_ALREADY_EXISTS);
    }
    if (await vendorRepository.findActiveByEmail(domainId, email)) {
      throw new Error(Messages.VENDOR.EMAIL_ALREADY_EXISTS);
    }

    return vendorRepository.create({
      ...vendorFields(dto),
      code,
      name: dto.name,
      email,
      status: dto.status ? normalizeStatus(dto.status) : 'ACTIVE',
      searchText: buildSearchText({ ...dto, code, email }),
      domainId,
      isDeleted: false,
    });
  },

  async findAll(
    domainId: string,
    query: {
      page?: string;
      limit?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
    },
  ) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    const [total, data] = await vendorRepository.listByDomain(
      domainId,
      limit,
      (page - 1) * limit,
      { status: query.status, searchKey: query.searchKey },
    );

    return { data, pagination: { total, page, limit } };
  },

  async findOne(domainId: string, id: string) {
    const vendor = await vendorRepository.findByIdAndDomain(id, domainId);
    if (!vendor) throw new Error(Messages.VENDOR.NOT_FOUND);
    return vendor;
  },

  async update(domainId: string, id: string, dto: Partial<VendorDto>) {
    const existing = await VendorService.findOne(domainId, id);
    const code = dto.code ? normalizeCode(dto.code) : existing.code;
    const email = dto.email ? dto.email.trim().toLowerCase() : existing.email;

    if (await vendorRepository.findActiveByCode(domainId, code, id)) {
      throw new Error(Messages.VENDOR.CODE_ALREADY_EXISTS);
    }
    if (await vendorRepository.findActiveByEmail(domainId, email, id)) {
      throw new Error(Messages.VENDOR.EMAIL_ALREADY_EXISTS);
    }

    const { status } = dto;
    const fields = vendorFields(dto);
    const updated = { ...existing, ...fields, code, email };
    return vendorRepository.update(id, {
      ...fields,
      code,
      email,
      ...(status && { status: normalizeStatus(status) }),
      searchText: buildSearchText(updated),
    });
  },

  async softDelete(domainId: string, id: string) {
    await VendorService.findOne(domainId, id);
    return vendorRepository.softDelete(id);
  },
};
