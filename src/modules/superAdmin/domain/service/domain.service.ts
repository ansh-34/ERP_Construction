import { DomainRepository, RoleRepository } from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { hashPassword } from '@utils/bcrypt';

export const DomainService = {
  async addDomain(data: {
    name: string;
    email: string;
    password: string;
    roleId: string;
  }) {
    const existing = await DomainRepository.count({
      OR: [{ name: data.name }, { email: data.email.toLowerCase() }],
    });
    if (existing > 0) {
      throw new Error('Domain with same name or email already exists');
    }
    if (data.roleId) {
      const role = await RoleRepository.findById(data.roleId);
      if (!role) {
        throw new Error('Role not found');
      }
    }

    data.email = data.email.toLowerCase();
    data.password = await hashPassword(data.password);

    const domain = await DomainRepository.create(
      data.name,
      data.email,
      data.password,
      data.roleId,
    );

    return domain;
  },

  async editDomain(
    domainId: string,
    data: {
      name?: string;
      status?: StatusEnum;
    },
  ) {
    const existing = await DomainRepository.findById(domainId);
    if (!existing) {
      throw new Error('Domain not found');
    }

    if (data.name && data.name !== existing.name) {
      const duplicate = await DomainRepository.count({
        name: data.name,
      });

      if (duplicate > 0) {
        throw new Error('Domain with this name already exists');
      }
    }

    const updatedDomain = await DomainRepository.update(domainId, {
      name: data.name ?? existing.name,
      status: (data.status ?? existing.status) as StatusEnum,
    });

    return updatedDomain;
  },

  async removeDomain(domainId: string) {
    const existing = await DomainRepository.findById(domainId);
    if (!existing) {
      throw new Error('Domain not found');
    }

    return DomainRepository.softDelete(domainId);
  },

  async listDomains(query: any) {
    const whereFilter: any = {};

    if (query.searchKey) {
      whereFilter.OR = [
        { name: { contains: query.searchKey, mode: 'insensitive' } },
        { email: { contains: query.searchKey, mode: 'insensitive' } },
      ];
    }
    if (query.status) {
      whereFilter.status = query.status;
    }
    if (query.isEmailVerified !== undefined) {
      whereFilter.is_email_verified = query.isEmailVerified === 'true';
    }

    return DomainRepository.list(
      whereFilter,
      parseInt(query.limit) || 10,
      parseInt(query.offset) || 0,
    );
  },

  async getDomain(domainId: string) {
    const domain = await DomainRepository.findById(domainId);
    if (!domain) {
      throw new Error('Domain not found');
    }

    return domain;
  },
};
