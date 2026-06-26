import { systemUserTypeRepository } from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import { normalizePrismaError } from '@/utils/prismaError';

type LocalizedText = Record<string, string>;

interface CreateSystemUserTypeInput {
  name: LocalizedText;
  code?: string;
  description?: LocalizedText;
  status?: StatusEnum;
}

interface UpdateSystemUserTypeInput {
  name?: LocalizedText;
  code?: string;
  description?: LocalizedText | null;
  status?: StatusEnum;
}

function normalizeCode(code: string): string {
  return code.toString().trim().toLowerCase().replace(/\s+/g, '_');
}

function buildSearchText(data: {
  name?: LocalizedText;
  code?: string;
  description?: LocalizedText | null;
}) {
  return [
    data.code,
    ...(data.name ? Object.values(data.name) : []),
    ...(data.description ? Object.values(data.description) : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export const systemUserTypeService = {
  async create(data: CreateSystemUserTypeInput) {
    try {
      const code = normalizeCode(data.code || data.name.en);
      const existing = await systemUserTypeRepository.findDuplicate(code);
      if (existing) throw new Error('user type code already exists');

      return await systemUserTypeRepository.create({
        name: data.name,
        code,
        searchText: buildSearchText({ ...data, code }),
        description: data.description,
        status: data.status ?? StatusEnum.ACTIVE,
      });
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async list(
    query: PaginationQuery & {
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
    },
  ) {
    try {
      const { offset, limit } = normalizePagination(query);
      const [totalCount, userTypes] = await systemUserTypeRepository.list(
        limit,
        offset,
        {
          status: query.status,
          searchKey: query.searchKey,
        },
      );

      return {
        userTypes,
        pagination: {
          totalCount,
          offset,
          limit,
        },
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async getById(id: string) {
    try {
      const userType = await systemUserTypeRepository.findById(id);
      if (!userType) throw new Error('user type not found');
      return userType;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async update(id: string, data: UpdateSystemUserTypeInput) {
    try {
      const existing = await systemUserTypeRepository.findById(id);
      if (!existing) throw new Error('user type not found');

      const code = data.code ? normalizeCode(data.code) : undefined;
      if (code && code !== existing.code) {
        const duplicate = await systemUserTypeRepository.findDuplicate(
          code,
          id,
        );
        if (duplicate) throw new Error('user type code already exists');
      }

      const name = data.name ?? (existing.name as LocalizedText);
      const description =
        data.description === undefined
          ? (existing.description as LocalizedText | null)
          : data.description;

      return await systemUserTypeRepository.update(id, {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined
          ? { description: data.description ?? Prisma.DbNull }
          : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(code ? { code } : {}),
        searchText: buildSearchText({
          name,
          code: code ?? existing.code,
          description,
        }),
      });
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async softDelete(id: string) {
    try {
      const existing = await systemUserTypeRepository.findById(id);
      if (!existing) throw new Error('user type not found');
      return await systemUserTypeRepository.softDelete(id);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
