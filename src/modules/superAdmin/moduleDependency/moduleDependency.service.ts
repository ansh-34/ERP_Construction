import { Messages } from '../../../constants/index.js';
import {
  ModuleDependencyRepository,
  ModulePermissionRepository,
  ModuleRepository,
} from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { CreateModuleDependencyData } from './moduleDependency.validator.js';

export const ModuleDependencyService = {
  async createModuleDependency(data: CreateModuleDependencyData) {
    const { moduleId, dependentModuleId } = data;

    if (!moduleId || !dependentModuleId) {
      throw new Error(Messages.MODULE_DEPENDENCY.REQUIRED);
    }

    if (moduleId === dependentModuleId) {
      throw new Error(Messages.MODULE_DEPENDENCY.CANNOT_DEPEND_ON_SELF);
    }

    const [parentModule, childModule] = await Promise.all([
      ModuleRepository.findActiveById(moduleId),
      ModuleRepository.findActiveById(dependentModuleId),
    ]);

    if (!parentModule) {
      throw new Error(Messages.MODULE_DEPENDENCY.PARENT_NOT_FOUND);
    }

    if (!childModule) {
      throw new Error(Messages.MODULE_DEPENDENCY.DEPENDENT_NOT_FOUND);
    }

    const parentModulePermission =
      await ModulePermissionRepository.findByModuleId(moduleId);

    if (
      !parentModulePermission ||
      parentModulePermission.permissions.length === 0
    ) {
      throw new Error(Messages.MODULE_DEPENDENCY.PARENT_PERMISSIONS_REQUIRED);
    }

    const existing = await ModuleDependencyRepository.findByPair(
      moduleId,
      dependentModuleId,
    );

    if (existing) {
      throw new Error(Messages.MODULE_DEPENDENCY.ALREADY_EXISTS);
    }

    return ModuleDependencyRepository.create({
      moduleId,
      dependentModuleId,
      permissions: parentModulePermission.permissions,
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

    await ModuleDependencyRepository.delete(id);
  },
};
