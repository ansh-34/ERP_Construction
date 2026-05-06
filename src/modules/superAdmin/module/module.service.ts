import { Messages } from '../../../constants/index.js';
import { ModuleRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const ModuleService = {
  async createModule(data: { name: any; code: string }) {
    const { name, code } = data;

    if (!name || !code) {
      throw new Error(Messages.MODULE.NAME_CODE_REQUIRED);
    }

    const existing = await ModuleRepository.findActiveByCode(code);

    if (existing) {
      throw new Error(Messages.MODULE.CODE_ALREADY_EXISTS);
    }

    return ModuleRepository.create({ name, code });
  },

  async listModules(query: PaginationQuery) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, modules] = await ModuleRepository.listActive(
      limit,
      offset,
    );

    return {
      modules,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async updateModule(
    id: string,
    data: { name?: any; code?: string; status?: string },
  ) {
    const { name, code, status } = data;

    const mod = await ModuleRepository.findActiveById(id);

    if (!mod) {
      throw new Error(Messages.MODULE.NOT_FOUND);
    }

    if (code && code !== mod.code) {
      const duplicate = await ModuleRepository.findDuplicateCode(code, id);
      if (duplicate) {
        throw new Error(Messages.MODULE.CODE_ALREADY_EXISTS);
      }
    }

    return ModuleRepository.update(id, {
      ...(name !== undefined && { name }),
      ...(code !== undefined && { code }),
      ...(status !== undefined && { status }),
    });
  },

  async deleteModule(id: string) {
    const mod = await ModuleRepository.findActiveById(id);

    if (!mod) {
      throw new Error(Messages.MODULE.NOT_FOUND);
    }

    await ModuleRepository.softDelete(id);
  },
};
