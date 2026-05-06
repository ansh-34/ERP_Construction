import { Messages } from '../../../constants/index.js';
import { ModuleRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const ModuleService = {
  async listModules(
    query: {
      offset: number;
      limit: number;
      searchKey?: string;
    },
    langCode: string,
  ) {
    const { offset, limit } = normalizePagination({
      offset: query.offset,
      limit: query.limit,
    });
    const searchKey = query.searchKey || '';

    const [totalCount, modules = []] = await ModuleRepository.listActive(
      limit,
      offset,
      {
        filter: {
          searchKey,
          status: 'active',
        },
      },
    );

    const normalizedModules = modules.map((mod: any) => ({
      id: mod.id,
      name: mod.name[langCode] || mod.name.en || '',
      code: mod.code,
      status: mod.status,
    }));

    return {
      modules: normalizedModules,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getModule(id: string, language: string | null = null) {
    const mod = await ModuleRepository.findActiveById(id, {
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        modulePermissions: {
          select: {
            permission: {
              select: { id: true, name: true, code: true },
            },
          },
        },
        parentDependencies: {
          select: {
            dependentModule: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            moduleDependencyPermissions: {
              select: {
                permission: {
                  select: { id: true, name: true, code: true },
                },
              },
            },
          },
        },
      },
    });
    if (!mod) {
      throw new Error(Messages.MODULE.NOT_FOUND);
    }
    if (language) {
      mod.name = mod.name[language] || mod.name.en || '';
      mod.parentDependencies = mod.parentDependencies.map((dep: any) => ({
        ...dep,
        dependentModule: {
          ...dep.dependentModule,
          name:
            dep.dependentModule.name[language] ||
            dep.dependentModule.name.en ||
            '',
        },
        moduleDependencyPermissions: dep.moduleDependencyPermissions.map(
          (mdp: any) => ({
            ...mdp,
            permission: {
              ...mdp.permission,
              name:
                mdp.permission.name[language] || mdp.permission.name.en || '',
            },
          }),
        ),
      }));
      mod.modulePermissions = mod.modulePermissions.map((mp: any) => ({
        ...mp,
        permission: {
          ...mp.permission,
          name: mp.permission.name[language] || mp.permission.name.en || '',
        },
      }));
    }
    return mod;
  },
};
