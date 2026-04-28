import { ModuleRepository } from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { generateCode } from '@/utils/code';

export const ModuleService = {
  async addModule(data: { name: string }) {
    let code = generateCode('MODULE');

    while (await ModuleRepository.findByCode(code)) {
      code = generateCode('MODULE');
    }

    return ModuleRepository.create(data.name, code);
  },

  async editModule(
    moduleId: string,
    data: {
      name?: string;
      status?: StatusEnum;
    },
  ) {
    const existing = await ModuleRepository.findById(moduleId);

    if (!existing) {
      throw new Error('Module not found');
    }

    return ModuleRepository.update(moduleId, {
      name: data.name ?? existing.name,
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
