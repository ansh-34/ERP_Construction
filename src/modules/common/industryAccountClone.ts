import { randomUUID } from 'crypto';
import {
  AccountCategoryType,
  NormalBalance,
} from '../../infra/database/prisma/generated/prisma/client/enums.js';
import { Messages } from '../../constants/index.js';
import {
  accountCategoryRepository,
  accountRepository,
  IndustryAccountCategoryRepository,
  IndustryAccountRepository,
} from '../../repositories/index.js';

type LocalizedName = Record<string, string>;
type NodeInfo = { id: string; path: string; level: number };

const buildSearchText = (name: unknown, code: string) =>
  [...Object.values((name as LocalizedName) ?? {}), code]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

export type CloneIndustryTemplatesInput = {
  domainId: string;
  adminId: string;
  costCenterId: string;
  industryAccountCategoryIds?: string[];
  industryAccountIds?: string[];
};

export const cloneIndustryTemplates = async ({
  domainId,
  adminId,
  costCenterId,
  industryAccountCategoryIds = [],
  industryAccountIds = [],
}: CloneIndustryTemplatesInput) => {
  const summary = {
    createdCategories: 0,
    reusedCategories: 0,
    createdAccounts: 0,
    reusedAccounts: 0,
  };

  // 1. Load the selected industry accounts (so we also clone their categories).
  const industryAccounts =
    await IndustryAccountRepository.findManyByIds(industryAccountIds);
  if (industryAccounts.length !== industryAccountIds.length) {
    throw new Error(Messages.COST_CENTER.INVALID_INDUSTRY_ACCOUNT);
  }

  // 2. Categories to clone = explicitly selected ∪ categories used by accounts.
  const neededCategoryIds = Array.from(
    new Set([
      ...industryAccountCategoryIds,
      ...industryAccounts.map((a) => a.industryAccountCategoryId),
    ]),
  );
  const industryCategories =
    await IndustryAccountCategoryRepository.findManyByIds(neededCategoryIds);
  if (
    industryAccountCategoryIds.some(
      (id) => !industryCategories.find((c) => c.id === id),
    )
  ) {
    throw new Error(Messages.COST_CENTER.INVALID_INDUSTRY_CATEGORY);
  }

  // 3. Clone categories (parents first via level asc), mapping old id -> tenant.
  const categoryMap = new Map<string, NodeInfo>();
  for (const ic of industryCategories) {
    const existing = await accountCategoryRepository.findByCode(
      ic.code,
      domainId,
    );
    if (existing) {
      categoryMap.set(ic.id, {
        id: existing.id,
        path: existing.path,
        level: existing.level,
      });
      summary.reusedCategories += 1;
      continue;
    }

    const parentInfo = ic.parentId ? categoryMap.get(ic.parentId) : null;
    const id = randomUUID();
    const level = parentInfo ? parentInfo.level + 1 : 0;
    const path = parentInfo ? `${parentInfo.path}/${id}` : id;

    await accountCategoryRepository.create({
      id,
      name: ic.name as object,
      code: ic.code,
      categoryType: ic.categoryType as unknown as AccountCategoryType,
      normalBalance: ic.normalBalance as unknown as NormalBalance,
      parentId: parentInfo?.id ?? null,
      path,
      level,
      sortOrder: ic.sortOrder,
      isPostingAllowed: ic.isPostingAllowed,
      isSystem: true,
      searchText: buildSearchText(ic.name, ic.code),
      status: 'ACTIVE',
      domainId,
      adminId,
      isDeleted: false,
    });
    if (parentInfo?.id) {
      await accountCategoryRepository.incrementChildrenCount(parentInfo.id, 1);
    }
    categoryMap.set(ic.id, { id, path, level });
    summary.createdCategories += 1;
  }

  const accountMap = new Map<string, NodeInfo>();
  for (const ia of industryAccounts) {
    const existing = await accountRepository.findByCode(ia.code, domainId);
    if (existing) {
      accountMap.set(ia.id, {
        id: existing.id,
        path: existing.path,
        level: existing.level,
      });
      summary.reusedAccounts += 1;
      continue;
    }

    const tenantCategory = categoryMap.get(ia.industryAccountCategoryId);
    if (!tenantCategory) {
      throw new Error(Messages.COST_CENTER.INVALID_INDUSTRY_CATEGORY);
    }

    const parentInfo = ia.parentId ? accountMap.get(ia.parentId) : null;
    const id = randomUUID();
    const level = parentInfo ? parentInfo.level + 1 : 0;
    const path = parentInfo ? `${parentInfo.path}/${id}` : id;

    await accountRepository.create({
      id,
      name: ia.name as object,
      code: ia.code,
      description: ia.description ?? null,
      accountCategoryId: tenantCategory.id,
      parentId: parentInfo?.id ?? null,
      path,
      level,
      isCashOrBank: ia.isCashOrBank,
      isPostingAllowed: ia.isPostingAllowed,
      isSystem: true,
      isActive: true,
      sortOrder: ia.sortOrder,
      costCenterId,
      searchText: buildSearchText(ia.name, ia.code),
      status: 'ACTIVE',
      domainId,
      adminId,
      isDeleted: false,
    });
    if (parentInfo?.id) {
      await accountRepository.incrementChildrenCount(parentInfo.id, 1);
    }
    accountMap.set(ia.id, { id, path, level });
    summary.createdAccounts += 1;
  }

  return summary;
};
