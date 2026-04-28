import { ModuleRepository } from '@repositories/index';
import { StatusEnum } from '@constants/index';

export const ModuleService = {
  async addModule(data: { name: string; code: string }) {
    const existing = await ModuleRepository.findByCode(data.code);

    if (existing) {
      throw new Error('Module already exists');
    }

    return ModuleRepository.create(data.name, data.code);
  },

  async editModule(
    moduleId: string,
    data: {
      name?: string;
      code?: string;
      status?: StatusEnum;
    },
  ) {
    const existing = await ModuleRepository.findById(moduleId);

    if (!existing) {
      throw new Error('Module not found');
    }

    if (data.code && data.code !== existing.code) {
      const duplicate = await ModuleRepository.findDuplicateCode(
        data.code,
        moduleId,
      );

      if (duplicate) {
        throw new Error('A Module with this code already exists');
      }
    }

    return ModuleRepository.update(moduleId, {
      name: data.name ?? existing.name,
      code: data.code ?? existing.code,
      status: (data.status ?? existing.status) as StatusEnum,
    });
  },

  async removeModule(moduleId: string) {
    const existing = await ModuleRepository.findById(moduleId);

    if (!existing) {
      throw new Error('Module not found');
    }

    return ModuleRepository.softDelete(moduleId);
  },

  async listModules(query: any) {
    const whereFilter: any = {
      isDeleted: false,
    };

    if (query.searchKey) {
      whereFilter.OR = [
        {
          name: {
            contains: query.searchKey,
            mode: 'insensitive',
          },
        },
        {
          code: {
            contains: query.searchKey,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (query.status) {
      whereFilter.status = query.status;
    }

    const totalCount = await ModuleRepository.count(whereFilter);

    const modules = await ModuleRepository.list(
      whereFilter,
      Number(query.limit) || 50,
      Number(query.offset) || 0,
    );

    return {
      modules,
      totalCount,
    };
  },
};
