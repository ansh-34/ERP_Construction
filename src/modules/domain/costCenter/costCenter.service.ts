import { randomUUID } from 'crypto';
import { Messages } from '../../../constants/index.js';
import { costCenterRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { cloneIndustryTemplates } from '../../common/industryAccountClone.js';

type LocalizedName = Record<string, string>;

type CostCenterDto = {
  name: LocalizedName;
  description?: string;
  parentId?: string;
  costCenterId?: string;
  projectId?: string;
  industryIds?: string[];
  industryCategoryIds?: string[];
  isSystem?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
};

const buildSearchText = (name: LocalizedName, code: string) =>
  [...Object.values(name), code].filter(Boolean).join(' ').toLowerCase();

const codeFromName = (name: LocalizedName) =>
  (name.en ?? '').toString().trim().toUpperCase().replace(/\s+/g, '_');

const mutableFields = (dto: Partial<CostCenterDto>) => ({
  ...(dto.description !== undefined && { description: dto.description }),
  ...(dto.costCenterId !== undefined && { costCenterId: dto.costCenterId }),
  ...(dto.projectId !== undefined && { projectId: dto.projectId }),
  ...(dto.industryIds !== undefined && { industryIds: dto.industryIds }),
  ...(dto.industryCategoryIds !== undefined && {
    industryCategoryIds: dto.industryCategoryIds,
  }),
  ...(dto.isSystem !== undefined && { isSystem: dto.isSystem }),
});

export const CostCenterService = {
  async create(domainId: string, adminId: string, dto: CostCenterDto) {
    const code = codeFromName(dto.name);
    const duplicate = await costCenterRepository.findByCode(code, domainId);
    if (duplicate) throw new Error(Messages.COST_CENTER.DUPLICATE_CODE);

    let level = 0;
    let parent = null;
    if (dto.parentId) {
      parent = await costCenterRepository.findByIdAndDomain(
        dto.parentId,
        domainId,
        adminId,
      );
      if (!parent) throw new Error(Messages.COST_CENTER.PARENT_NOT_FOUND);
      level = parent.level + 1;
    }

    const id = randomUUID();
    const path = parent ? `${parent.path}/${id}` : id;

    const created = await costCenterRepository.create({
      id,
      ...mutableFields(dto),
      name: dto.name,
      code,
      parentId: dto.parentId ?? null,
      path,
      level,
      status: dto.status ?? 'ACTIVE',
      searchText: buildSearchText(dto.name, code),
      domainId,
      adminId,
      isDeleted: false,
    });

    if (parent) {
      await costCenterRepository.incrementChildrenCount(parent.id, 1);
    }

    if (
      (dto.industryCategoryIds && dto.industryCategoryIds.length > 0) ||
      (dto.industryIds && dto.industryIds.length > 0)
    ) {
      await cloneIndustryTemplates({
        domainId,
        adminId,
        costCenterId: created.id,
        industryAccountCategoryIds: dto.industryCategoryIds ?? [],
        industryAccountIds: dto.industryIds ?? [],
      });
    }

    return created;
  },

  async findAll(
    domainId: string,
    adminId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      parentId?: string;
    },
  ) {
    const { offset, limit } = normalizePagination(query);
    const [totalCount, data] = await costCenterRepository.listByDomain(
      domainId,
      adminId,
      limit,
      offset,
      {
        status: query.status,
        searchKey: query.searchKey,
        parentId: query.parentId,
      },
    );
    return { data, pagination: { totalCount, offset, limit } };
  },

  async findOne(domainId: string, adminId: string, id: string) {
    const costCenter = await costCenterRepository.findByIdAndDomain(
      id,
      domainId,
      adminId,
    );
    if (!costCenter) throw new Error(Messages.COST_CENTER.NOT_FOUND);
    return costCenter;
  },

  async update(
    domainId: string,
    adminId: string,
    id: string,
    dto: Partial<CostCenterDto>,
  ) {
    const existing = await CostCenterService.findOne(domainId, adminId, id);

    const name = dto.name ?? (existing.name as LocalizedName);
    const code = dto.name ? codeFromName(dto.name) : existing.code;

    if (dto.name && code !== existing.code) {
      const duplicate = await costCenterRepository.findByCode(code, domainId);
      if (duplicate && duplicate.id !== id) {
        throw new Error(Messages.COST_CENTER.DUPLICATE_CODE);
      }
    }

    return costCenterRepository.update(id, {
      ...mutableFields(dto),
      ...(dto.name !== undefined && { name: dto.name, code }),
      ...(dto.status !== undefined && { status: dto.status }),
      searchText: buildSearchText(name, code),
    });
  },

  async softDelete(domainId: string, adminId: string, id: string) {
    const existing = await CostCenterService.findOne(domainId, adminId, id);
    if (existing.childrenCount > 0) {
      throw new Error(Messages.COST_CENTER.HAS_CHILDREN);
    }
    const accountCount = await costCenterRepository.countAccounts(id);
    if (accountCount > 0) {
      throw new Error(Messages.COST_CENTER.HAS_ACCOUNTS);
    }
    const deleted = await costCenterRepository.softDelete(id);
    if (existing.parentId) {
      await costCenterRepository.incrementChildrenCount(existing.parentId, -1);
    }
    return deleted;
  },
};
