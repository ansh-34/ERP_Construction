import { Messages } from '../../../constants/index.js';
import { transaction } from '../../../infra/database/prisma/transaction.js';
import {
  ModuleDependencyPermissionRepository,
  ModuleDependencyRepository,
  ModulePermissionRepository,
  ModuleRepository,
} from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { CreateModuleDependencyData } from './moduleDependency.validator.js';

export const ModuleDependencyService = {
  async createModuleDependency(data: CreateModuleDependencyData) {
    const { moduleId, dependentModuleId, permissionIds } = data;

    if (!moduleId || !dependentModuleId) {
      throw new Error(Messages.MODULE_DEPENDENCY.REQUIRED);
    }

    if (moduleId === dependentModuleId) {
      throw new Error(Messages.MODULE_DEPENDENCY.CANNOT_DEPEND_ON_SELF);
    }

    const [parentModule, childModule, existing, validDependencyPermissions] =
      await Promise.all([
        ModuleRepository.findActiveById(moduleId),
        ModuleRepository.findActiveById(dependentModuleId),
        ModuleDependencyRepository.findByPair(moduleId, dependentModuleId),
        ModulePermissionRepository.validateModulesPermissions(
          permissionIds.map((id) => ({
            moduleId: dependentModuleId,
            permissionId: id,
          })),
        ),
      ]);

    if (!parentModule) {
      throw new Error(Messages.MODULE_DEPENDENCY.PARENT_NOT_FOUND);
    }

    if (!childModule) {
      throw new Error(Messages.MODULE_DEPENDENCY.DEPENDENT_NOT_FOUND);
    }

    if (existing) {
      throw new Error(Messages.MODULE_DEPENDENCY.ALREADY_EXISTS);
    }

    if (!validDependencyPermissions) {
      throw new Error(Messages.MODULE_DEPENDENCY.INVALID_PERMISSIONS);
    }

    return await transaction(async (tx: any) => {
      const modDep = await ModuleDependencyRepository.create(
        { moduleId, dependentModuleId },
        { transaction: tx },
      );

      await ModuleDependencyPermissionRepository.bulkCreate(
        permissionIds.map((permissionId) => ({
          moduleDependencyId: modDep.id,
          permissionId,
        })),
        { transaction: tx },
      );

      return modDep;
    });
  },

  async listModuleDependencies(query: PaginationQuery) {
    const { offset, limit } = normalizePagination(query, 20);

    const [totalCount, dependencies] = await ModuleDependencyRepository.list(
      limit,
      offset,
    );

    return {
      dependencies,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async deleteModuleDependency(id: string) {
    const dependency = await ModuleDependencyRepository.findById(id);

    if (!dependency) {
      throw new Error(Messages.MODULE_DEPENDENCY.NOT_FOUND);
    }

    await ModuleDependencyRepository.softDelete(id);
  },
};
