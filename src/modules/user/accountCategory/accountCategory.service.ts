import { randomUUID } from 'crypto';
import { Messages } from '../../../constants/index.js';
import { accountCategoryRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';

type CategoryType = 'ASSET' | 'LIABILITY' | 'REVENUE' | 'EXPENSE';
type NormalBalance = 'DEBIT' | 'CREDIT';

type LocalizedName = Record<string, string>;

type AccountCategoryDto = {
  name: LocalizedName;
  code: string;
  categoryType: CategoryType;
  normalBalance: NormalBalance;
  parentId?: string;
  sortOrder?: number;
  isPostingAllowed?: boolean;
  isSystem?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
};

const buildSearchText = (name: LocalizedName, code: string) =>
  [...Object.values(name), code].filter(Boolean).join(' ').toLowerCase();

const mutableFields = (dto: Partial<AccountCategoryDto>) => ({
  ...(dto.code !== undefined && { code: dto.code }),
  ...(dto.categoryType !== undefined && { categoryType: dto.categoryType }),
  ...(dto.normalBalance !== undefined && { normalBalance: dto.normalBalance }),
  ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
  ...(dto.isPostingAllowed !== undefined && {
    isPostingAllowed: dto.isPostingAllowed,
  }),
  ...(dto.isSystem !== undefined && { isSystem: dto.isSystem }),
});

export const AccountCategoryService = {
  async create(domainId: string, adminId: string, dto: AccountCategoryDto) {
    const duplicate = await accountCategoryRepository.findByCode(
      dto.code,
      domainId,
    );
    if (duplicate) throw new Error(Messages.ACCOUNT_CATEGORY.DUPLICATE_CODE);

    let path = '';
    let level = 0;
    let parent = null;
    if (dto.parentId) {
      parent = await accountCategoryRepository.findByIdAndDomain(
        dto.parentId,
        domainId,
        adminId,
      );
      if (!parent) throw new Error(Messages.ACCOUNT_CATEGORY.PARENT_NOT_FOUND);
      level = parent.level + 1;
    }

    const id = randomUUID();
    path = parent ? `${parent.path}/${id}` : id;

    const created = await accountCategoryRepository.create({
      id,
      ...mutableFields(dto),
      name: dto.name,
      code: dto.code,
      categoryType: dto.categoryType,
      normalBalance: dto.normalBalance,
      parentId: dto.parentId ?? null,
      path,
      level,
      status: dto.status ?? 'ACTIVE',
      searchText: buildSearchText(dto.name, dto.code),
      domainId,
      adminId,
      isDeleted: false,
    });

    if (parent) {
      await accountCategoryRepository.incrementChildrenCount(parent.id, 1);
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
      categoryType?: CategoryType;
      parentId?: string;
    },
  ) {
    const { offset, limit } = normalizePagination(query);
    const [totalCount, data] = await accountCategoryRepository.listByDomain(
      domainId,
      adminId,
      limit,
      offset,
      {
        status: query.status,
        searchKey: query.searchKey,
        categoryType: query.categoryType,
        parentId: query.parentId,
      },
    );
    return { data, pagination: { totalCount, offset, limit } };
  },

  async findOne(domainId: string, adminId: string, id: string) {
    const category = await accountCategoryRepository.findByIdAndDomain(
      id,
      domainId,
      adminId,
    );
    if (!category) throw new Error(Messages.ACCOUNT_CATEGORY.NOT_FOUND);
    return category;
  },

  async update(
    domainId: string,
    adminId: string,
    id: string,
    dto: Partial<AccountCategoryDto>,
  ) {
    const existing = await AccountCategoryService.findOne(
      domainId,
      adminId,
      id,
    );

    if (dto.code !== undefined && dto.code !== existing.code) {
      const duplicate = await accountCategoryRepository.findByCode(
        dto.code,
        domainId,
      );
      if (duplicate && duplicate.id !== id) {
        throw new Error(Messages.ACCOUNT_CATEGORY.DUPLICATE_CODE);
      }
    }

    const name = dto.name ?? (existing.name as LocalizedName);
    const code = dto.code ?? existing.code;

    return accountCategoryRepository.update(id, {
      ...mutableFields(dto),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.status !== undefined && { status: dto.status }),
      searchText: buildSearchText(name, code),
    });
  },

  async softDelete(domainId: string, adminId: string, id: string) {
    const existing = await AccountCategoryService.findOne(
      domainId,
      adminId,
      id,
    );
    if (existing.childrenCount > 0) {
      throw new Error(Messages.ACCOUNT_CATEGORY.HAS_CHILDREN);
    }
    const accountCount = await accountCategoryRepository.countAccounts(id);
    if (accountCount > 0) {
      throw new Error(Messages.ACCOUNT_CATEGORY.HAS_ACCOUNTS);
    }
    const deleted = await accountCategoryRepository.softDelete(id);
    if (existing.parentId) {
      await accountCategoryRepository.incrementChildrenCount(
        existing.parentId,
        -1,
      );
    }
    return deleted;
  },
};
