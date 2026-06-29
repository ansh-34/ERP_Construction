import { randomUUID } from 'node:crypto';
import type {
  IndustryEnum,
  StatusEnum,
} from '../../../infra/database/prisma/generated/prisma/client/enums.js';
import {
  IndustryAccountCategoryRepository,
  IndustryAccountRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { normalizePrismaError } from '../../../utils/prismaError.js';

type LocalizedName = Record<string, string>;
type AccountInput = {
  name: LocalizedName;
  code?: string;
  description?: string | null;
  parentId?: string | null;
  industryAccountCategoryId: string;
  currencyId?: string | null;
  isCashOrBank?: boolean;
  isPostingAllowed?: boolean;
  isSystem?: boolean;
  sortOrder?: number;
  industryType: IndustryEnum;
  status?: StatusEnum;
};

const normalizeCode = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

const buildSearchText = (
  name: LocalizedName,
  code: string,
  description?: string | null,
) =>
  `${Object.values(name).join(' ')} ${code} ${description ?? ''}`.toLowerCase();

const localize = (record: { name: unknown }, language: string) => {
  const names = record.name as Record<string, string>;
  return { ...record, name: names[language] ?? names.en ?? '' };
};

export const IndustryAccountService = {
  async create(data: AccountInput, language: string = 'en') {
    try {
      const id = randomUUID();
      const code = normalizeCode(data.code ?? data.name.en);
      if (!code) throw new Error('invalid code');

      if (
        await IndustryAccountRepository.findDuplicate(data.industryType, code)
      ) {
        throw new Error('duplicate code');
      }

      const category = await IndustryAccountCategoryRepository.findById(
        data.industryAccountCategoryId,
      );
      if (
        !category ||
        category.industryType !== data.industryType ||
        category.childrenCount > 0 ||
        category.isPostingAllowed
      ) {
        throw new Error(
          'Account cannot reference a missing or non-leaf category',
        );
      }

      let parent = null;
      if (data.parentId) {
        parent = await IndustryAccountRepository.findById(data.parentId);
        if (
          !parent ||
          parent.industryType !== data.industryType ||
          parent.industryAccountCategoryId !== data.industryAccountCategoryId
        ) {
          throw new Error('Parent account not found');
        }
      }

      if (
        data.currencyId &&
        !(await IndustryAccountRepository.currencyExists(data.currencyId))
      ) {
        throw new Error('Currency not found');
      }

      const created = await IndustryAccountRepository.create(
        {
          id,
          name: data.name,
          code,
          searchText: buildSearchText(data.name, code, data.description),
          description: data.description,
          parentId: parent?.id,
          path: parent ? `${parent.path}/${id}` : `/${id}`,
          level: parent ? parent.level + 1 : 0,
          industryAccountCategoryId: category.id,
          currencyId: data.currencyId,
          isCashOrBank: data.isCashOrBank ?? false,
          isPostingAllowed: data.isPostingAllowed ?? true,
          isSystem: data.isSystem ?? true,
          sortOrder: data.sortOrder ?? 0,
          industryType: data.industryType,
          status: data.status ?? 'ACTIVE',
        },
        parent?.id,
      );

      return localize(created, language);
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async list(
    query: {
      offset?: number | string;
      limit?: number | string;
      industryType?: IndustryEnum;
      categoryId?: string;
      parentId?: string;
      isPostingAllowed?: boolean;
      isCashOrBank?: boolean;
      status?: StatusEnum;
      searchKey?: string;
    },
    language: string = 'en',
  ) {
    try {
      const { offset, limit } = normalizePagination(query);
      const [totalCount, records] = await IndustryAccountRepository.list(
        limit,
        offset,
        {
          industryType: query.industryType,
          categoryId: query.categoryId,
          parentId: query.parentId,
          isPostingAllowed: query.isPostingAllowed,
          isCashOrBank: query.isCashOrBank,
          status: query.status,
          searchKey: query.searchKey,
        },
      );
      const data = records.map((record) => localize(record, language));
      return { data, pagination: { totalCount, offset, limit } };
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async getById(id: string, language: string = 'en') {
    try {
      const record = await IndustryAccountRepository.findById(id);
      if (!record) throw new Error('Industry account not found');
      return localize(record, language);
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async update(
    id: string,
    data: Partial<
      Omit<AccountInput, 'industryType' | 'industryAccountCategoryId'>
    >,
    language: string = 'en',
  ) {
    try {
      const existing = await IndustryAccountRepository.findById(id);
      if (!existing) throw new Error('Industry account not found');

      const code = normalizeCode(data.code ?? data.name?.en ?? existing.code);
      if (
        await IndustryAccountRepository.findDuplicate(
          existing.industryType,
          code,
          id,
        )
      ) {
        throw new Error('duplicate code');
      }
      if (data.isPostingAllowed === true && existing.childrenCount > 0) {
        throw new Error('Account with children cannot allow posting');
      }
      if (
        data.currencyId &&
        !(await IndustryAccountRepository.currencyExists(data.currencyId))
      ) {
        throw new Error('Currency not found');
      }

      let move:
        | {
            oldParentId: string | null;
            newParentId: string | null;
            oldPath: string;
            newPath: string;
            levelDelta: number;
          }
        | undefined;
      let parentId = existing.parentId;
      let path = existing.path;
      let level = existing.level;

      if (data.parentId !== undefined && data.parentId !== existing.parentId) {
        const parent = data.parentId
          ? await IndustryAccountRepository.findById(data.parentId)
          : null;
        if (
          data.parentId &&
          (!parent ||
            parent.industryType !== existing.industryType ||
            parent.industryAccountCategoryId !==
              existing.industryAccountCategoryId)
        ) {
          throw new Error('Parent account not found');
        }
        if (
          parent &&
          (parent.id === id || parent.path.startsWith(`${existing.path}/`))
        ) {
          throw new Error('Account cannot be moved below itself');
        }

        parentId = parent?.id ?? null;
        const newPath = parent ? `${parent.path}/${id}` : `/${id}`;
        const newLevel = parent ? parent.level + 1 : 0;
        move = {
          oldParentId: existing.parentId,
          newParentId: parentId,
          oldPath: path,
          newPath,
          levelDelta: newLevel - level,
        };
        path = newPath;
        level = newLevel;
      }

      const name = data.name ?? (existing.name as LocalizedName);
      const description =
        data.description === undefined
          ? existing.description
          : data.description;
      const updated = await IndustryAccountRepository.update(
        id,
        {
          ...(data.name !== undefined && { name }),
          code,
          searchText: buildSearchText(name, code, description),
          ...(data.description !== undefined && { description }),
          ...(data.parentId !== undefined && { parentId, path, level }),
          ...(data.currencyId !== undefined && {
            currencyId: data.currencyId,
          }),
          ...(data.isCashOrBank !== undefined && {
            isCashOrBank: data.isCashOrBank,
          }),
          ...(data.isPostingAllowed !== undefined && {
            isPostingAllowed: data.isPostingAllowed,
          }),
          ...(data.isSystem !== undefined && { isSystem: data.isSystem }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
          ...(data.status !== undefined && { status: data.status }),
        },
        move,
      );

      return localize(updated, language);
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async delete(id: string) {
    try {
      const existing = await IndustryAccountRepository.findById(id);
      if (!existing) throw new Error('Industry account not found');
      if (existing.childrenCount > 0) {
        throw new Error('Account with children cannot be deleted');
      }
      await IndustryAccountRepository.softDelete(id, existing.parentId);
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },
};
