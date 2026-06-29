import { randomUUID } from 'node:crypto';
import type {
  AccountCategoryType,
  IndustryEnum,
  NormalBalance,
  StatusEnum,
} from '../../../infra/database/prisma/generated/prisma/client/enums.js';
import { IndustryAccountCategoryRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { normalizePrismaError } from '../../../utils/prismaError.js';

type LocalizedName = Record<string, string>;

type CategoryInput = {
  name: LocalizedName;
  code?: string;
  categoryType: AccountCategoryType;
  normalBalance: NormalBalance;
  parentId?: string | null;
  industryType: IndustryEnum;
  sortOrder?: number;
  isPostingAllowed?: boolean;
  isSystem?: boolean;
  status?: StatusEnum;
};

const normalizeCode = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

const buildSearchText = (name: LocalizedName, code: string) =>
  `${Object.values(name).join(' ')} ${code}`.toLowerCase();

const localize = (record: { name: unknown }, language: string) => {
  const names = record.name as Record<string, string>;
  return { ...record, name: names[language] ?? names.en ?? '' };
};

export const IndustryAccountCategoryService = {
  async create(data: CategoryInput, language: string = 'en') {
    try {
      const id = randomUUID();
      const code = normalizeCode(data.code ?? data.name.en);
      if (!code) throw new Error('invalid code');

      if (
        await IndustryAccountCategoryRepository.findDuplicate(
          data.industryType,
          code,
        )
      ) {
        throw new Error('duplicate code');
      }

      let parent = null;
      if (data.parentId) {
        parent = await IndustryAccountCategoryRepository.findById(
          data.parentId,
        );
        if (!parent || parent.industryType !== data.industryType) {
          throw new Error('Parent category not found');
        }
        if (await IndustryAccountCategoryRepository.countAccounts(parent.id)) {
          throw new Error(
            'Parent category cannot have both accounts and child categories',
          );
        }
      }

      const created = await IndustryAccountCategoryRepository.create(
        {
          id,
          name: data.name,
          code,
          searchText: buildSearchText(data.name, code),
          categoryType: data.categoryType,
          normalBalance: data.normalBalance,
          parentId: parent?.id,
          path: parent ? `${parent.path}/${id}` : `/${id}`,
          level: parent ? parent.level + 1 : 0,
          industryType: data.industryType,
          sortOrder: data.sortOrder ?? 0,
          isPostingAllowed: data.isPostingAllowed ?? false,
          isSystem: data.isSystem ?? true,
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
      categoryType?: AccountCategoryType;
      parentId?: string;
      status?: StatusEnum;
      searchKey?: string;
    },
    language: string = 'en',
  ) {
    try {
      const { offset, limit } = normalizePagination(query);
      const [totalCount, records] =
        await IndustryAccountCategoryRepository.list(limit, offset, {
          industryType: query.industryType,
          categoryType: query.categoryType,
          parentId: query.parentId,
          status: query.status,
          searchKey: query.searchKey,
        });
      const data = records.map((record) => localize(record, language));
      return { data, pagination: { totalCount, offset, limit } };
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async getById(id: string, language: string = 'en') {
    try {
      const record = await IndustryAccountCategoryRepository.findById(id);
      if (!record) throw new Error('Industry account category not found');
      return localize(record, language);
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async update(
    id: string,
    data: Partial<Omit<CategoryInput, 'industryType'>>,
    language: string = 'en',
  ) {
    try {
      const existing = await IndustryAccountCategoryRepository.findById(id);
      if (!existing) throw new Error('Industry account category not found');

      const code = normalizeCode(data.code ?? data.name?.en ?? existing.code);
      if (
        await IndustryAccountCategoryRepository.findDuplicate(
          existing.industryType,
          code,
          id,
        )
      ) {
        throw new Error('duplicate code');
      }

      const accountCount =
        await IndustryAccountCategoryRepository.countAccounts(id);
      if (
        data.isPostingAllowed === true &&
        (existing.childrenCount > 0 || accountCount > 0)
      ) {
        throw new Error(
          'Category with children or accounts cannot allow direct posting',
        );
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
          ? await IndustryAccountCategoryRepository.findById(data.parentId)
          : null;

        if (
          data.parentId &&
          (!parent || parent.industryType !== existing.industryType)
        ) {
          throw new Error('Parent category not found');
        }
        if (
          parent &&
          (parent.id === id || parent.path.startsWith(`${path}/`))
        ) {
          throw new Error('Category cannot be moved below itself');
        }
        if (
          parent &&
          (await IndustryAccountCategoryRepository.countAccounts(parent.id))
        ) {
          throw new Error(
            'Parent category cannot have both accounts and child categories',
          );
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
      const updated = await IndustryAccountCategoryRepository.update(
        id,
        {
          ...(data.name !== undefined && { name }),
          code,
          searchText: buildSearchText(name, code),
          ...(data.categoryType !== undefined && {
            categoryType: data.categoryType,
          }),
          ...(data.normalBalance !== undefined && {
            normalBalance: data.normalBalance,
          }),
          ...(data.parentId !== undefined && { parentId, path, level }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
          ...(data.isPostingAllowed !== undefined && {
            isPostingAllowed: data.isPostingAllowed,
          }),
          ...(data.isSystem !== undefined && { isSystem: data.isSystem }),
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
      const existing = await IndustryAccountCategoryRepository.findById(id);
      if (!existing) throw new Error('Industry account category not found');
      const accountCount =
        await IndustryAccountCategoryRepository.countAccounts(id);
      if (existing.childrenCount > 0 || accountCount > 0) {
        throw new Error('Category with children or accounts cannot be deleted');
      }
      await IndustryAccountCategoryRepository.softDelete(id, existing.parentId);
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },
};
