import prisma from '@/infra/database/prisma/prisma.client.js';
import { Messages } from '../../../constants/index.js';
import {
  ModuleDependencyPermissionRepository,
  ModuleDependencyRepository,
  ModulePermissionRepository,
  ModuleRepository,
  PermissionRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const ModuleService = {
  async createModule(data: {
    name: Record<string, string>;
    code?: string;
    dependencyModules?: { moduleId: string; permissionIds: string[] }[];
    modulePermissionIds?: string[];
  }) {
    const { name, code: customCode, dependencyModules = [], modulePermissionIds = [] } = data;

    const incomingLanguageCodes: string[] = Object.keys(name);
    if (!incomingLanguageCodes.includes('en')) {
      throw new Error(Messages.MODULE.NAME_EN_CODE_REQUIRED);
    }

    const code = customCode
      ? customCode.toString().toUpperCase().replace(/\s+/g, '_')
      : name?.en?.toString().toUpperCase().replace(/\s+/g, '_');
    const searchText = Object.values(name).join(' ').toLowerCase();

    const [
      existingModule,
      allAreValidDependencies,
      allAreValidModuleDependenciesPermissions,
      allAreValidPermissions,
    ] = await Promise.all([
      ModuleRepository.findActiveByCode(code),
      ModuleRepository.validateModuleIds(
        dependencyModules.map((dm) => dm.moduleId) || [],
      ),
      ModulePermissionRepository.validateModulesPermissions(
        dependencyModules.flatMap((dm) =>
          dm.permissionIds.map((permissionId) => ({
            moduleId: dm.moduleId,
            permissionId,
          })),
        ),
      ),
      PermissionRepository.validatePermissionIds(modulePermissionIds || []),
    ]);

    if (existingModule) {
      throw new Error(Messages.MODULE.CODE_ALREADY_EXISTS);
    }
    if (!allAreValidDependencies) {
      throw new Error(Messages.MODULE.INVALID_DEPENDENCIES);
    }
    if (!allAreValidPermissions) {
      throw new Error(Messages.MODULE.INVALID_PERMISSIONS);
    }
    if (!allAreValidModuleDependenciesPermissions) {
      throw new Error(Messages.MODULE.INVALID_DEPENDENCY_PERMISSIONS);
    }

    return await prisma.$transaction(async (tx: any) => {
      const mod = await ModuleRepository.create(
        {
          name,
          code,
          searchText,
          parentDependenciesCount: dependencyModules.length,
          activeParentDependenciesCount: dependencyModules.length,
        },
        { transaction: tx },
      );

      let createdDependenciesMap: Record<string, string> = {};

      if (dependencyModules?.length) {
        const result = await ModuleDependencyRepository.bulkCreate(
          dependencyModules.map((dm) => ({
            moduleId: mod.id,
            dependentModuleId: dm.moduleId,
          })),
          { transaction: tx },
        );

        createdDependenciesMap = result.reduce(
          (acc: Record<string, string>, dm: any) => {
            acc[dm.dependentModuleId] = dm.id;
            return acc;
          },
          {},
        );
      }

      const promises = [];

      if (Object.keys(createdDependenciesMap).length > 0) {
        const dependencyPermissionsData = dependencyModules.flatMap((dm) => {
          const dependencyId = createdDependenciesMap[dm.moduleId];

          if (!dependencyId) {
            throw new Error(Messages.MODULE.INVALID_DEPENDENCIES);
          }

          return dm.permissionIds.map((permissionId) => ({
            moduleDependencyId: dependencyId,
            permissionId,
          }));
        });

        promises.push(
          ModuleDependencyPermissionRepository.bulkCreate(
            dependencyPermissionsData,
            { transaction: tx },
          ),
        );
      }

      if (modulePermissionIds.length > 0) {
        promises.push(
          ModulePermissionRepository.bulkCreate(
            modulePermissionIds.map((permissionId) => ({
              moduleId: mod.id,
              permissionId,
            })),
            { transaction: tx },
          ),
        );
      }

      await Promise.all(promises);

      return mod;
    });
  },

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
        },
        select: {
          id: true,
          name: true,
          code: true,
          parentDependenciesCount: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          modulePermissions: {
            where: {
              isDeleted: false,
              permission: {
                isDeleted: false,
              },
            },
            select: {
              id: true,
              permission: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      },
    );

    const normalizedModules = modules.map((mod: any) => ({
      id: mod.id,
      name: mod.name[langCode] || mod.name.en || '',
      code: mod.code,
      status: mod.status,
      parentDependenciesCount: mod.parentDependenciesCount,
      activeParentDependenciesCount: mod.activeParentDependenciesCount,
      createdAt: mod.createdAt,
      updatedAt: mod.updatedAt,
      modulePermissions: mod.modulePermissions.map((mp: any) => ({
        ...mp,
        permission: {
          ...mp.permission,
          name: mp.permission.name[langCode] || mp.permission.name.en || '',
        },
      })),
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

  async updateModule(id: string, data: { name?: any; status?: 'ACTIVE' | 'INACTIVE' }) {
    const { name, status } = data;
    let code: string | null = null;
    let searchText: string | null = null;

    const mod = await ModuleRepository.findActiveById(id);
    if (!mod) {
      throw new Error(Messages.MODULE.NOT_FOUND);
    }

    if (name) {
      const incomingLanguageCodes: string[] = Object.keys(name);
      if (!incomingLanguageCodes.includes('en')) {
        throw new Error(Messages.MODULE.NAME_EN_CODE_REQUIRED);
      }

      code = name?.en?.toString().toUpperCase().replace(/\s+/g, '_');
      searchText = Object.values(name).join(' ').toLowerCase();

      if (code && code !== mod.code) {
        const duplicate = await ModuleRepository.findDuplicateCode(code, id);
        if (duplicate) {
          throw new Error(Messages.MODULE.CODE_ALREADY_EXISTS);
        }
      }
    }

    return ModuleRepository.update(id, {
      ...(name && { name }),
      ...(code && { code }),
      ...(status && { status }),
      ...(searchText && { searchText }),
    });
  },

  async getModule(id: string, language: string | null = null) {
    const mod = await ModuleRepository.findActiveById(id, {
      select: {
        id: true,
        name: true,
        code: true,
        status: true,

        modulePermissions: {
          where: {
            isDeleted: false,
            permission: {
              isDeleted: false,
            },
          },
          select: {
            id: true,
            permission: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },

        parentDependencies: {
          where: {
            isDeleted: false,
            dependentModule: {
              isDeleted: false,
            },
          },
          select: {
            id: true,
            dependentModule: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },

            moduleDependencyPermissions: {
              where: {
                isDeleted: false,
                permission: {
                  isDeleted: false,
                },
              },
              select: {
                id: true,
                permission: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  },
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

  async deleteModule(id: string) {
    const mod = await ModuleRepository.findActiveById(id);

    if (!mod) {
      throw new Error(Messages.MODULE.NOT_FOUND);
    }

    await ModuleRepository.softDelete(id);
  },
};
