import { userTypeRepository } from '@repositories/index';
import type { IndustryEnum } from '@infra/database/prisma/generated/prisma/client/enums';
import { normalizePagination } from '@/utils/pagination';
import { normalizePrismaError } from '@/utils/prismaError';

type LocalizedText = Record<string, string>;

interface CreateUserTypeInput {
  name: LocalizedText;
  description?: string;
  industryType: IndustryEnum;
}

interface UpdateUserTypeInput {
  name?: LocalizedText;
  description?: string | null;
  industryType?: IndustryEnum;
}

function deriveCode(nameEn: string): string {
  return nameEn.toString().trim().toUpperCase().replace(/\s+/g, '_');
}

export const userTypeService = {
  async create(data: CreateUserTypeInput) {
    try {
      const code = deriveCode(data.name.en);
      const existing = await userTypeRepository.findDuplicate(
        data.industryType,
        code,
      );
      if (existing) throw new Error('user type code already exists');

      return await userTypeRepository.create({
        name: data.name,
        code,
        description: data.description,
        industryType: data.industryType,
      });
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async list(query: {
    offset?: number | string;
    limit?: number | string;
    industryType?: IndustryEnum;
    searchKey?: string;
    [key: string]: unknown;
  }) {
    try {
      const { offset, limit } = normalizePagination(query);
      const [totalCount, userTypes] = await userTypeRepository.list(
        limit,
        offset,
        {
          industryType: query.industryType,
          searchKey: query.searchKey,
        },
      );

      return {
        userTypes,
        pagination: { totalCount, offset, limit },
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async getById(id: string) {
    try {
      const userType = await userTypeRepository.findById(id);
      if (!userType) throw new Error('user type not found');
      return userType;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async update(id: string, data: UpdateUserTypeInput) {
    try {
      const existing = await userTypeRepository.findById(id);
      if (!existing) throw new Error('user type not found');

      const code = data.name?.en ? deriveCode(data.name.en) : undefined;
      const industryType = data.industryType ?? existing.industryType;

      const codeChanged = !!code && code !== existing.code;
      const industryChanged =
        !!data.industryType && data.industryType !== existing.industryType;
      if (codeChanged || industryChanged) {
        const duplicate = await userTypeRepository.findDuplicate(
          industryType,
          code ?? existing.code,
          id,
        );
        if (duplicate) throw new Error('user type code already exists');
      }

      return await userTypeRepository.update(id, {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.industryType !== undefined
          ? { industryType: data.industryType }
          : {}),
        ...(code ? { code } : {}),
      });
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async softDelete(id: string) {
    try {
      const existing = await userTypeRepository.findById(id);
      if (!existing) throw new Error('user type not found');
      return await userTypeRepository.softDelete(id);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
