import { randomUUID } from 'crypto';
import { Messages } from '../../../constants/index.js';
import {
  accountCategoryRepository,
  accountRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';

type LocalizedName = Record<string, string>;

type AccountDto = {
  name: LocalizedName;
  code: string;
  description?: string;
  accountCategoryId: string;
  parentId?: string;
  currencyId?: string;
  costCenterId?: string;
  projectId?: string;
  isCashOrBank?: boolean;
  isPostingAllowed?: boolean;
  isSystem?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  status?: 'ACTIVE' | 'INACTIVE';
};

const buildSearchText = (name: LocalizedName, code: string) =>
  [...Object.values(name), code].filter(Boolean).join(' ').toLowerCase();

const mutableFields = (dto: Partial<AccountDto>) => ({
  ...(dto.code !== undefined && { code: dto.code }),
  ...(dto.description !== undefined && { description: dto.description }),
  ...(dto.accountCategoryId !== undefined && {
    accountCategoryId: dto.accountCategoryId,
  }),
  ...(dto.currencyId !== undefined && { currencyId: dto.currencyId }),
  ...(dto.costCenterId !== undefined && { costCenterId: dto.costCenterId }),
  ...(dto.projectId !== undefined && { projectId: dto.projectId }),
  ...(dto.isCashOrBank !== undefined && { isCashOrBank: dto.isCashOrBank }),
  ...(dto.isPostingAllowed !== undefined && {
    isPostingAllowed: dto.isPostingAllowed,
  }),
  ...(dto.isSystem !== undefined && { isSystem: dto.isSystem }),
  ...(dto.isActive !== undefined && { isActive: dto.isActive }),
  ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
});

const assertLeafCategory = async (
  accountCategoryId: string,
  domainId: string,
  adminId: string,
) => {
  const category = await accountCategoryRepository.findByIdAndDomain(
    accountCategoryId,
    domainId,
    adminId,
  );
  if (!category) throw new Error(Messages.ACCOUNT.CATEGORY_NOT_FOUND);
  if (category.childrenCount > 0) {
    throw new Error(Messages.ACCOUNT.CATEGORY_NOT_LEAF);
  }
  return category;
};

export const AccountService = {
  async create(domainId: string, adminId: string, dto: AccountDto) {
    const duplicate = await accountRepository.findByCode(dto.code, domainId);
    if (duplicate) throw new Error(Messages.ACCOUNT.DUPLICATE_CODE);

    await assertLeafCategory(dto.accountCategoryId, domainId, adminId);

    let path = '';
    let level = 0;
    let parent = null;
    if (dto.parentId) {
      parent = await accountRepository.findByIdAndDomain(
        dto.parentId,
        domainId,
        adminId,
      );
      if (!parent) throw new Error(Messages.ACCOUNT.PARENT_NOT_FOUND);
      level = parent.level + 1;
    }

    const id = randomUUID();
    path = parent ? `${parent.path}/${id}` : id;

    const created = await accountRepository.create({
      id,
      ...mutableFields(dto),
      name: dto.name,
      code: dto.code,
      accountCategoryId: dto.accountCategoryId,
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
      await accountRepository.incrementChildrenCount(parent.id, 1);
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
      accountCategoryId?: string;
      parentId?: string;
      isCashOrBank?: boolean;
    },
  ) {
    const { offset, limit } = normalizePagination(query);
    const [totalCount, data] = await accountRepository.listByDomain(
      domainId,
      adminId,
      limit,
      offset,
      {
        status: query.status,
        searchKey: query.searchKey,
        accountCategoryId: query.accountCategoryId,
        parentId: query.parentId,
        isCashOrBank: query.isCashOrBank,
      },
    );
    return { data, pagination: { totalCount, offset, limit } };
  },

  async findOne(domainId: string, adminId: string, id: string) {
    const account = await accountRepository.findByIdAndDomain(
      id,
      domainId,
      adminId,
    );
    if (!account) throw new Error(Messages.ACCOUNT.NOT_FOUND);
    return account;
  },

  async update(
    domainId: string,
    adminId: string,
    id: string,
    dto: Partial<AccountDto>,
  ) {
    const existing = await AccountService.findOne(domainId, adminId, id);

    if (dto.code !== undefined && dto.code !== existing.code) {
      const duplicate = await accountRepository.findByCode(dto.code, domainId);
      if (duplicate && duplicate.id !== id) {
        throw new Error(Messages.ACCOUNT.DUPLICATE_CODE);
      }
    }

    if (
      dto.accountCategoryId !== undefined &&
      dto.accountCategoryId !== existing.accountCategoryId
    ) {
      await assertLeafCategory(dto.accountCategoryId, domainId, adminId);
    }

    const name = dto.name ?? (existing.name as LocalizedName);
    const code = dto.code ?? existing.code;

    return accountRepository.update(id, {
      ...mutableFields(dto),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.status !== undefined && { status: dto.status }),
      searchText: buildSearchText(name, code),
    });
  },

  async softDelete(domainId: string, adminId: string, id: string) {
    const existing = await AccountService.findOne(domainId, adminId, id);
    if (existing.childrenCount > 0) {
      throw new Error(Messages.ACCOUNT.HAS_CHILDREN);
    }
    const deleted = await accountRepository.softDelete(id);
    if (existing.parentId) {
      await accountRepository.incrementChildrenCount(existing.parentId, -1);
    }
    return deleted;
  },
};
